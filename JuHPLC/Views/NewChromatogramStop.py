from django.shortcuts import redirect
from JuHPLC.SerialCommunication.MicroControllerManager import MicroControllerManager
from JuHPLC.models import Chromatogram


def NewChromatogramStop(request):

    #checkAccess(request)
    #todo: is own or if is others and can stop others permission

    chromatogram = Chromatogram.objects.get(pk=request.POST.get("id", 0))

    while not (MicroControllerManager.getinstance()\
        .stopacquisitionforchromatogram(
        chromatogram)):
        pass

    return redirect('ChromatogramDetails', id=request.POST.get("id", 0))