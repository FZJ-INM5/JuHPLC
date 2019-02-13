from asgiref.sync import AsyncToSync
from channels.layers import get_channel_layer
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import permission_required
from django.core import serializers
import json

from django.views.decorators.csrf import csrf_exempt

from JuHPLC.models import *


def SetDeadTime(request, chromatogramid, DeadTime):
    if request.user and request.user.is_authenticated and request.user.has_perm('chromatogram.chromatogram_edit'):
        c = Chromatogram.objects.get(pk=chromatogramid)
        c.DeadTime = DeadTime
        c.save()
        channel_layer = get_channel_layer()

        AsyncToSync(channel_layer.group_send)("ChromatogramDetails_%s" % c.id, {
            'message': {'DeadTime':DeadTime},
            'type': 'hplc.setDeadTime'
        })

        return HttpResponse()
    else:
        return HttpResponse(status=401)

@permission_required('chromatogram.chromatogram_delete')
def delete(request,chromatogramid):
    c = Chromatogram.objects.get(pk=chromatogramid)
    HplcData.objects.filter(Chromatogram=c).delete()
    Baseline.objects.filter(Chromatogram=c).delete()
    Peak.objects.filter(Chromatogram=c).delete()
    Eluent.objects.filter(Chromatogram=c).delete()
    c.delete()

    return HttpResponse()

def GetChromatogramsWithPeaksNamed(request,peakName):
    result = []

    c = Peak.objects.filter(Name__icontains=peakName).all()
    for i in c:
        result.append(JuHPLC.API.JSONChromatogram.JSONJuHPLCChromatogram(i.Chromatogram_id).__dict__)


    return JsonResponse(
        {
            "chromatograms": json.dumps(result),
        })

@csrf_exempt
def AddMarker(request, chromatogramid):
    if request.user and request.user.is_authenticated and request.user.has_perm('chromatogram.chromatogram_edit'):
        c = Chromatogram.objects.get(pk=chromatogramid)

        m = Marker(Chromatogram=c,Time=request.POST.get("Time", ""),Text=request.POST.get("Text", ""))


        m.save()
        return HttpResponse()
    else:
        return HttpResponse(status=401)