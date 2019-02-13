import subprocess
import tempfile

import jsonpickle
import json
import serial
import serial.tools.list_ports
from django.http import HttpResponse
from django.shortcuts import render

import WebApp.settings
from JuHPLC.API.JSONChromatogram import JSONJuHPLCChromatogram
from JuHPLC.HelperClass import HelperClass
from JuHPLC.SerialCommunication.MicroControllerManager import MicroControllerManager
from JuHPLC.models import Chromatogram, Eluent, Solvent
import JuHPLC.ThinClientConsumers


def ChromatogramDetails(request, id):
    chrom = Chromatogram.objects.get(pk=id)
    running = MicroControllerManager.getinstance().chromatogramhasactiveacquisition(chrom)

    ports = []

    eluents = Eluent.objects.filter(Chromatogram=chrom).all()
    solvents = []

    for e in eluents:
        for s in Solvent.objects.filter(Eluent=e).all():
            solvents.append(s)

    jc = JSONJuHPLCChromatogram(id)
    jchroma = json.dumps(jc.__dict__)

    hasdata = "Data" in jc.Data and len(jc.Data["Data"]) > 0
    if not hasdata and not running:
        #ports = serial.tools.list_ports.comports()
        ports = []
        for i in JuHPLC.ThinClientConsumers.ThinClientConsumer.clients:
            for j in JuHPLC.ThinClientConsumers.ThinClientConsumer.clients[i]:
                ports.append(i+" - "+j)
        for i in serial.tools.list_ports.comports():
            ports.append(i.device+" - "+i.description)

    if not request.GET._mutable:
        request.GET._mutable = True

    if request.GET.get('export', 'false') == 'false':
        request.GET['nocompress'] = True


    return render(request, "ChromatogramDetails.html", {
        "chromatogram": chrom,
        "num": id,
        "ports": ports,
        "isrunning": running,
        "islocalhost": HelperClass.islocalhost(request),
        "eluents": eluents,
        "data": hasdata,
        "solvents": solvents,
        "jsonChromatogram": jchroma,
        "mods":"",
        "rheodyneSwitch":chrom.RheodyneSwitch,
        "useMarker":WebApp.settings.USE_MARKER_IN_CHROMATOGRAM
    })

def PDFDownload(request, id):
    intId = int(id) # fails here if something other than an integer is passed to prevent exploitation

    tmpDir = tempfile.TemporaryDirectory()
    filename = str(id)+"-Chromatogram.pdf"


    #make a pdf from the details page
    pipe = subprocess.Popen(
        [WebApp.settings.CHROMIUM_PATH,
         "--headless",
         "--disable-gpu",
         "--print-to-pdf="+tmpDir.name+"/"+filename,
         "http://localhost:"+request.META['SERVER_PORT']+"/ChromatogramDetails/"+str(id),
         "--no-sandbox"])
    pipe.wait()

    data = []


    #read all the data into an array
    with open(tmpDir.name+"/"+filename,"rb") as binaryPdf:
        data = binaryPdf.read()

    #remove the temporary file
    #os.remove(tmpDir.name+"/"+filename)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'attachment; filename= "' + filename + '"'
    response.write(data)
    return response