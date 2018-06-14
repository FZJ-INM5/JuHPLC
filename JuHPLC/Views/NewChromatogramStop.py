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


def NewChromatogramStop(request):

    #checkAccess(request)
    #todo: is own or if is others and can stop others permission

    MicroControllerManager.getinstance()\
        .stopacquisitionforchromatogram(
        Chromatogram.objects.get(pk=request.POST.get("id", 0)))

    return redirect('ChromatogramDetails', id=request.POST.get("id", 0))