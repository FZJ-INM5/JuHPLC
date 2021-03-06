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
from JuHPLC.SerialCommunication.MicroControllerConnectionViaThinclient import MicroControllerConnectionViaThinclient
from JuHPLC.HelperClass import HelperClass
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize
from django.contrib.auth.decorators import permission_required
from JuHPLC.models import Chromatogram


@permission_required('chromatogram.chromatogram_start')
def NewChromatogramStart(request):

    chromatogram = Chromatogram.objects.get(pk=request.POST.get("id", 0))
    for port in request.POST.getlist("portname", ""):
        MicroControllerManager.getinstance()\
            .startacquisition(
            chromatogram,
            port)

    return redirect('/ChromatogramDetails/'+request.POST.get("id", 0)+"?autorefresh=true")