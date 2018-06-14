from django.http import JsonResponse

from JuHPLC.models import *
from JuHPLC.SerialCommunication.MicroControllerManager import MicroControllerManager



def HplcDataForChromatogram(request, chromatogramid):
    return HplcDataSinceTimestamp(request, chromatogramid, 0)

def HplcDataForChromatogramSavitzkyGolay(request, chromatogramid, timestamp,poly,window,deriv):
    pass

def HplcDataSinceTimestamp(request, chromatogramid, timestamp):

    if MicroControllerManager.getinstance().getConnectionForChromatogramID(chromatogramid) != None:
        return getCurrentChromatogramData(chromatogramid,timestamp)
    
    
    c = Chromatogram.objects.get(pk=chromatogramid)
    # data = HplcData.objects.filter(Chromatogram=c).all()[::1]

    channels = HplcData.objects.raw("SELECT DISTINCT JuHPLC_hplcdata.id,ChannelName from JuHPLC_hplcdata WHERE Chromatogram_id='"+str(c.id)+"';")

    # .all() fetches the data from the queryset
    # .values() makes it a dict that is json serializable

    tmp = {}

    for chan in channels:
        tmp[chan.ChannelName] = HplcData.objects.filter(Chromatogram=c).filter(Datetime__gt=timestamp).filter(ChannelName=chan.ChannelName).order_by("Datetime").all().values('ChannelName','Datetime','Value')[::1]



    return JsonResponse(
        {
            "hplcdata": tmp,
            "NextChromatogram":c.NextChromatogram
        })

def getCurrentChromatogramData(chromatogramid,timestamp):

    data = MicroControllerManager.getinstance().getConnectionForChromatogramID(chromatogramid).dataCache
    tmp = {}
    
    for key, value in data.items():
        if key not in tmp:
            tmp[key]=[]
        for i in range(int(timestamp)+1,len(value)):
            tmp[key].append(value[i])
    
    
    return JsonResponse(
        {
            "hplcdata": tmp,
        })

def getColumns(request):
    data = Chromatogram.objects.values_list('Column', flat=True).distinct()[::1]
    return JsonResponse(
        {"suggestions":data}
    )