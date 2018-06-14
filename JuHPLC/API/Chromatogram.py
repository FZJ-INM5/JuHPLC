from django.http import HttpResponse
from django.contrib.auth.decorators import permission_required


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