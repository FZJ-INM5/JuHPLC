from django.http import HttpResponse, JsonResponse
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.models import Permission, User
from django.shortcuts import get_object_or_404


from JuHPLC.models import *


def delete(request,calibrationid):
    if request.user and request.user.is_authenticated and request.user.has_perm('chromatogram.chromatogram_delete'):
        c = Calibration.objects.get(pk=calibrationid)
        c.delete()
        return HttpResponse()
    else:
        return HttpResponse(status=401)

