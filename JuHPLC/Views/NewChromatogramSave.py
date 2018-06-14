import jsonpickle
from django.shortcuts import render
from django.http import HttpResponse

from JuHPLC.API import HplcData
from JuHPLC.API.JSONChromatogram import JSONJuHPLCChromatogram
from JuHPLC.models import *
import datetime
import serial
import serial.tools.list_ports
import time
import sys
import re
import glob
import json
from django.shortcuts import redirect
from JuHPLC.SerialCommunication.MicroControllerManager import MicroControllerManager
from JuHPLC.HelperClass import HelperClass
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize
from django.contrib.auth.decorators import permission_required
from JuHPLC.models import Chromatogram, Eluent, Solvent


def NewChromatogramSave(request):

    chromatogram = Chromatogram()
    chromatogram.Sample = request.POST.get("HPLCSampleName")
    chromatogram.Column = request.POST.get("HPLCColumn")
    chromatogram.Flow = request.POST.get("HPLCFlow")
    chromatogram.InjectionVolume = request.POST.get("HPLCInjectionVolume")
    chromatogram.Concentration = request.POST.get("HPLCConcentration")
    chromatogram.Datetime = datetime.datetime.now().timestamp()
    chromatogram.Comment = request.POST.get("HPLCComment")
    chromatogram.ChannelOrderShift = request.POST.get("HPLCChannelOrderShift")
    chromatogram.AcquireADC = request.POST.get("HPLCADCAcquisition") == 'on'
    chromatogram.UVWavelength = request.POST.get("HPLCUVWaveLength")
    chromatogram.FactorsUnits = request.POST.get("HPLCFactorsUnits")
    chromatogram.MaxRuntime = request.POST.get("HPLCMaxRuntime")
    chromatogram.RheodyneSwitch = request.POST.get("HPLCRheodyneSwitch") == 'on'
    chromatogram.ConcentrationUnit = request.POST.get("HPLCConcentrationUnit")
    chromatogram.SampleRate = request.POST.get("HPLCSampleRate")
    chromatogram.NextChromatogram = 0

    try:
        # we can use the deadtime of the last measurement, since most of the time this won't change while developing
        # a method. later on, this can be adjusted by the user anyways, just being convenient here
        chromatogram.DeadTime = Chromatogram.objects.order_by("-Datetime").first().DeadTime
    except:
        chromatogram.DeadTime = 1

    chromatogram.save()

    for i in range(0,4):
        eluent = Eluent()
        eluent.Chromatogram = chromatogram


        solvs = []

        for j in range(0, 4):
            if(request.POST.get("HPLCEluent"+str(i)+"-"+str(j),"") != ""):
                solvent = Solvent()
                solvent.Name = request.POST.get("HPLCEluent"+str(i)+"-"+str(j), "")
                solvent.Percentage = request.POST.get("HPLCEluent"+str(i)+"-C-"+str(j), 0)
                solvs.append(solvent)

        if(len(solvs) > 0):
            eluent.save()
            for s in solvs:
                s.Eluent = eluent
            Solvent.objects.bulk_create(solvs)

    return redirect('ChromatogramDetails', id=chromatogram.id)
    # return render(request, "NewChromatogramSave.html", { "chromatogram" : chromatogram })