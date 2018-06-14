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
from JuHPLC.API.JSONChromatogram import JSONJuHPLCChromatogram
from JuHPLC.HelperClass import HelperClass
from JuHPLC.models import Chromatogram, Eluent, Solvent
from django.contrib.auth import authenticate, login, logout


def loginMethod(request):
    if request.method == 'GET':
        return render(request, "Login.html",{})
    elif request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            return render(request,'Login.html', {"error":"Login Failed"})

def logoutMethod(request):
    logout(request)
    return render(request, 'Login.html', {"msg":"Logout Successful"})