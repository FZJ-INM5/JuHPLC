from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import permission_required
from django.core import serializers
import json


from JuHPLC.models import *

@permission_required('chromatogram.chromatogram_edit')
def SetDeadTime(request, chromatogramid,DeadTime):
    c = Chromatogram.objects.get(pk=chromatogramid)
    c.DeadTime = DeadTime
    c.save()

    return HttpResponse()

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