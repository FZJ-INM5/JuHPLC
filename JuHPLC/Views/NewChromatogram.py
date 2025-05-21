import jsonpickle
from django.shortcuts import render
from django.http import HttpResponse, HttpRequest

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
from typing import List
from django.contrib.auth.decorators import permission_required



def NewChromatogram(request):  # pragma: no cover - heavy DB access
    factorsUnits = ""
    latestChrom=Chromatogram()
    eluents=[]
    solvents = []
    channelOrderShift = "UV - 0, Counter - 30"
    # 18F-Chemistry is used most often in our case, so set this as a sane default for decay correction calculation.
    halfLife = "109"
    try:
        latestChrom = Chromatogram.objects.order_by("-Datetime").filter(User=request.user).first()

        #we don't have a chromatogram for this user yet, so load the default data from any user as a good starting point
        if latestChrom is None:
            latestChrom = Chromatogram.objects.order_by("-Datetime").first()

        eluents = Eluent.objects.filter(Chromatogram=latestChrom)
        solvents = []
        i=0
        for e in eluents:
            solvents.append([])
            for s in Solvent.objects.filter(Eluent=e).all():
                solvents[i].append(s)
            i+=1
        factorsUnits=latestChrom.FactorsUnits
        channelOrderShift=latestChrom.ChannelOrderShift
        halfLife=latestChrom.HalfLife
    except Exception as exp:
        factorsUnits = "UV - 0.001 - µAu\r\nCounter - 1 - CPS"

    return render(request,"NewChromatogram.html",{
        "FactorsUnits": factorsUnits,
        "LatestChrom":latestChrom,
        "solvents": solvents,
        "ChannelOrderShift":channelOrderShift,
        "HalfLife":halfLife
    })



def serial_ports() -> List[str]:
    """ Lists serial port names

        :raises EnvironmentError:
            On unsupported or unknown platforms
        :returns:
            A list of the serial ports available on the system
    """
    if sys.platform.startswith('win'):
        ports = ['COM%s' % (i + 1) for i in range(256)]
    elif sys.platform.startswith('linux') or sys.platform.startswith('cygwin'):
        # this excludes your current terminal "/dev/tty"
        ports = glob.glob('/dev/tty[A-Za-z]*')
    elif sys.platform.startswith('darwin'):
        ports = glob.glob('/dev/tty.*')
    else:
        raise EnvironmentError('Unsupported platform')

    result = []
    for port in ports:
        try:
            s = serial.Serial(port, timeout=1)
            s.close()
            result.append(port)
        except (OSError, serial.SerialException):
            pass
    return result

@permission_required('chromatogram.chromatogram_edit')
@csrf_exempt
def ChromatogramAddPeak(request,chromatogramid):
    data = request.body.decode('utf-8')
    data2 = json.loads(data)

    p = Peak()
    p.ChannelName=data2["GraphName"]
    p.Chromatogram=Chromatogram.objects.get(pk=chromatogramid)
    p.StartTime=data2["StartTime"]
    p.EndTime=data2["EndTime"]
    p.save()

    return HttpResponse(data2)

@permission_required('chromatogram.chromatogram_edit')
@csrf_exempt
def ChromatogramOverwritePeaks(request,chromatogramid):
    data = request.body.decode('utf-8')
    data2 = json.loads(data)

    chrom = Chromatogram.objects.get(pk=chromatogramid)

    Peak.objects.filter(Chromatogram=chrom).delete()

    for key in data2:
        for i in range(0,len(data2[key])):
            p = Peak()
            p.ChannelName = key
            p.Chromatogram = chrom
            p.StartTime = data2[key][i]["StartTime"]
            p.EndTime = data2[key][i]["EndTime"]
            p.Name = data2[key][i]["Name"]
            p.save()

    return HttpResponse(data2)

@permission_required('chromatogram.chromatogram_edit')
@csrf_exempt
def ChromatogramOverwriteBaseline(request,chromatogramid):


    data = request.body.decode('utf-8')
    data2 = json.loads(data)

    chrom = Chromatogram.objects.get(pk=chromatogramid)

    Baseline.objects.filter(Chromatogram=chrom).delete()

    for key in data2:
        baseline = Baseline()
        baseline.ChannelName = key
        baseline.Chromatogram = chrom
        baseline.DatetimeValue = data2[key]['DatetimeValue']
        if len(baseline.DatetimeValue) == 0:
            continue;
        baseline.Type = data2[key]['Type']

        baseline.save()

    return HttpResponse(data2)

@permission_required('chromatogram.chromatogram_edit')
@csrf_exempt
def ChromatogramSaveComment(request,chromatogramid):
    data = request.body.decode('utf-8')
    data2 = json.loads(data)

    chrom = Chromatogram.objects.get(pk=chromatogramid)
    chrom.Comment = data2["Comment"]
    chrom.save()

    return HttpResponse(data2)


def checkAccess(request: HttpRequest) -> None:
    if not HelperClass.islocalhost(request):
        raise Exception("You have to control the unit from the local machine!!")


def Config(request):
    return render(request, "Config.html", {"serialports": serial.tools.list_ports.comports()})


