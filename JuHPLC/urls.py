from django.conf.urls import url

import JuHPLC.Views.ChromatogramDetails
import JuHPLC.Views.NewChromatogramImport
import JuHPLC.Views.NewChromatogramSave
import JuHPLC.Views.NewChromatogramStart
import JuHPLC.Views.NewChromatogramStop
from . import views
from . import Views
from JuHPLC.API.HplcData import *
from JuHPLC.API.Chromatogram import *
import JuHPLC.Views.Login

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^NewChromatogram/save', JuHPLC.Views.NewChromatogramSave.NewChromatogramSave, name='NewChromatogramSave'),
    url(r'^NewChromatogram/start', JuHPLC.Views.NewChromatogramStart.NewChromatogramStart, name='NewChromatogramStart'),
    url(r'^NewChromatogram/stop', JuHPLC.Views.NewChromatogramStop.NewChromatogramStop, name='NewChromatogramStop'),
    url(r'^NewChromatogram', views.NewChromatogram, name='NewChromatogram'),


    url(r'^ChromatogramDetails/(?P<id>[0-9]+)$', JuHPLC.Views.ChromatogramDetails.ChromatogramDetails, name='ChromatogramDetails'),

    url(r'^Chromatogram/(?P<id>[0-9]+)/PDFDownload$', JuHPLC.Views.ChromatogramDetails.PDFDownload, name='ChromatogramDetailsPDF'),

    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/Import', JuHPLC.Views.NewChromatogramImport.ChromatogramImportDo, name='ChromatogramImportDo'),
    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/AddPeak', views.ChromatogramAddPeak, name='ChromatogramAddPeak'),

    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/OverwritePeaks', views.ChromatogramOverwritePeaks, name='ChromatogramOverwritePeaks'),
    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/OverwriteComment', views.ChromatogramSaveComment, name='ChromatogramSaveComment'),
    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/OverwriteBaseline', views.ChromatogramOverwriteBaseline, name='ChromatogramOverwriteBaseline'),

    url(r'^api/HplcData/(?P<chromatogramid>[0-9]+)$', HplcDataForChromatogram, name='HplcData'),
    url(r'^api/HplcData/(?P<chromatogramid>[0-9]+)/(?P<timestamp>[0-9]*\.?[0-9]+)$', HplcDataSinceTimestamp, name='HplcDataSinceTimestamp'),
    url(r'^api/HplcDataForChromatogramSavitzkyGolay/(?P<chromatogramid>[0-9]+)/(?P<timestamp>[0-9]*\.?[0-9]+)/(?P<poly>[0-9]*\.?[0-9]+)/(?P<window>[0-9]*\.?[0-9]+)/(?P<deriv>[0-9]*\.?[0-9]+)$', HplcDataForChromatogramSavitzkyGolay, name='HplcDataForChromatogramSavitzkyGolay'),
    url(r'^api/Chromatogram/(?P<chromatogramid>[0-9]+)/delete', delete, name='DeleteChromatogram'),

    url(r'^api/Chromatogram/(?P<chromatogramid>[0-9]+)/SetDeadTime/(?P<DeadTime>[0-9]+)$', SetDeadTime, name='SetDeadTime'),

    url(r'^api/getColumns', getColumns, name='getColumns'),


    url(r'^Config', views.Config, name='Config'),


    url(r'^login/$', JuHPLC.Views.Login.loginMethod, name='login'),
    url(r'^accounts/login/$', JuHPLC.Views.Login.loginMethod, name='login'),
    url(r'^logout/$', JuHPLC.Views.Login.logoutMethod, name='logout'),
]