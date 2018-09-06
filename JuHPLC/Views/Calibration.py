from django.shortcuts import redirect
from django.shortcuts import render
import json
from django.core.serializers import serialize


from JuHPLC.models import *


def CalibrationList(request):
    return render(request,"Calibration.html", {
        "calibrations": serialize('json', Calibration.objects.all())
    })



def NewCalibration(request):
    return render(request,"NewCalibration.html", {

    })


def EditCalibration(request,calibrationid):
    return render(request, "EditCalibration.html", {
        "calibrations": serialize('json', Calibration.objects.all()),
        "id":calibrationid
    })

def EditCalibrationSave(request,calibrationid):

    cal = Calibration.objects.get(pk=calibrationid)
    cal.Eluent = request.POST.get("Eluent")
    cal.Channel = request.POST.get("Channel")
    cal.Column = request.POST.get("Column")
    cal.Flow = request.POST.get("Flow")
    cal.RetentionFactor = request.POST.get("RetentionFactor")
    cal.RetentionFactorError = request.POST.get("RetentionFactorError")
    cal.Unit = request.POST.get("Unit")
    cal.Slope = request.POST.get("Slope")
    cal.YAxisIntercept = request.POST.get("YAxisIntercept")
    cal.UVWaveLength = request.POST.get("UVWaveLength")
    cal.Eluent = request.POST.get("Eluent")
    cal.Name = request.POST.get("Name")
    cal.Chromatograms.clear()

    for i in request.POST.get("Chromatograms").split(','):
        cal.Chromatograms.add(Chromatogram.objects.get(id=i))

    cal.save()

    return redirect("Calibration")

def NewCalibrationSave(request):

    cal = Calibration()
    cal.Eluent = request.POST.get("Eluent")
    cal.Channel = request.POST.get("Channel")
    cal.Column = request.POST.get("Column")
    cal.Flow = request.POST.get("Flow")
    cal.RetentionFactor = request.POST.get("RetentionFactor")
    cal.RetentionFactorError = request.POST.get("RetentionFactorError")
    cal.Unit = request.POST.get("Unit")
    cal.Slope = request.POST.get("Slope")
    cal.YAxisIntercept = request.POST.get("YAxisIntercept")
    cal.UVWaveLength = request.POST.get("UVWaveLength")
    cal.Eluent = request.POST.get("Eluent")
    cal.Name = request.POST.get("Name")

    cal.save()

    for i in request.POST.get("Chromatograms").split(','):
        cal.Chromatograms.add(Chromatogram.objects.get(id=i))

    cal.save()

    return redirect("Calibration")
