from JuHPLC.Views.NewChromatogram import *
from JuHPLC.SerialCommunication.MicroControllerManager import MicroControllerManager

# Create your views here.
def index(request):

    chromatograms = Chromatogram.objects.all().order_by("-Datetime")

    for i in chromatograms:
        i.data = HplcData.objects.filter(Chromatogram=i).count()>0

    return render(request, "index.html", {
                                            "chromatograms": chromatograms,
                                            "active": MicroControllerManager.getinstance().getactivechromatogramids()
                                        })


def mychromatograms(request):

    chromatograms = Chromatogram.objects.all().filter(User=request.user).order_by("-Datetime")

    for i in chromatograms:
        i.data = HplcData.objects.filter(Chromatogram=i).count()>0

    return render(request, "index.html", {
                                            "chromatograms": chromatograms,
                                            "active": MicroControllerManager.getinstance().getactivechromatogramids()
                                        })

