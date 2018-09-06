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


def ChromatogramImportDo(request, chromatogramid):
    if request.FILES["csvFile"].name.endswith(".asc"):
        importASCFileForChromatogram(request.FILES["csvFile"].read(), chromatogramid)
    else:
        importCSVFileForChromatogram(request.FILES["csvFile"].read(), chromatogramid)
    return redirect('ChromatogramDetails', id=request.POST.get("id", 0))


def importCSVFileForChromatogram(file, chromatogram_id):
    chromatogram = Chromatogram.objects.get(pk=chromatogram_id)

    t = 0
    normalized = file.decode("utf-8")
    normalized = re.sub("\r\n", "|", normalized)
    normalized = re.sub("\n", "|", normalized)
    normalized = re.sub("\r", "|", normalized)

    normalized_split=normalized.split('|')
    data = []


    channels = normalized_split[0].split(',')

    for line in normalized_split[1:len(normalized_split)-1]:
        linesplit = line.split(',')
        for i in range(1,len(channels)):
            d = HplcData()
            d.ChannelName = channels[i]
            d.Chromatogram = chromatogram
            d.Value = float(linesplit[i])
            d.Datetime = t
            data.append(d)

    HplcData.objects.bulk_create(data)

def importASCFileForChromatogram(file, chromatogram_id):
    chromatogram = Chromatogram.objects.get(pk=chromatogram_id)

    normalized = file.decode("utf-8")
    normalized = re.sub("\r\n", "|", normalized)
    normalized = re.sub("\n", "|", normalized)
    normalized = re.sub("\r", "|", normalized)

    normalized_split = normalized.split('|')
    data = []

    for i in range(3,int(normalized_split[2].split('=')[1])):
        d = HplcData()
        d.ChannelName = "UV"
        d.Chromatogram = chromatogram
        d.Value = float(normalized_split[i])/1000
        d.Datetime = i
        data.append(d)

    HplcData.objects.bulk_create(data)