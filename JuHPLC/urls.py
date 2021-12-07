from django.conf.urls import url

import JuHPLC.Views.ChromatogramDetails
import JuHPLC.Views.NewChromatogramImport
import JuHPLC.Views.NewChromatogramSave
import JuHPLC.Views.NewChromatogramStart
import JuHPLC.Views.NewChromatogramStop
import JuHPLC.Views.Calibration
from . import views
from . import Views
from JuHPLC.API.HplcData import *
from JuHPLC.API.Chromatogram import *
from JuHPLC.API.Calibration import *



import JuHPLC.Views.Login

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^mychromatograms/$', views.mychromatograms, name='mychromatograms'),
    url(r'^NewChromatogram/save', JuHPLC.Views.NewChromatogramSave.NewChromatogramSave, name='NewChromatogramSave'),
    url(r'^NewChromatogram/start', JuHPLC.Views.NewChromatogramStart.NewChromatogramStart, name='NewChromatogramStart'),
    url(r'^NewChromatogram/stop', JuHPLC.Views.NewChromatogramStop.NewChromatogramStop, name='NewChromatogramStop'),
    url(r'^NewChromatogram', views.NewChromatogram, name='NewChromatogram'),


    url(r'^ChromatogramDetails/(?P<id>[0-9]+)$', JuHPLC.Views.ChromatogramDetails.ChromatogramDetails, name='ChromatogramDetails'),

    url(r'^Calibration$', JuHPLC.Views.Calibration.CalibrationList, name='Calibration'),
    url(r'^Calibration/New$', JuHPLC.Views.Calibration.NewCalibration, name='NewCalibration'),
    url(r'^Calibration/New/Save$', JuHPLC.Views.Calibration.NewCalibrationSave, name='NewCalibrationSave'),
    url(r'^Calibration/Edit/(?P<calibrationid>[0-9]+)$', JuHPLC.Views.Calibration.EditCalibration, name='EditCalibration'),
    url(r'^Calibration/Edit/(?P<calibrationid>[0-9]+)/Save$', JuHPLC.Views.Calibration.EditCalibrationSave, name='EditCalibrationSave'),

    url(r'^Chromatogram/(?P<id>[0-9]+)/PDFDownload$', JuHPLC.Views.ChromatogramDetails.PDFDownload, name='ChromatogramDetailsPDF'),

    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/Import', JuHPLC.Views.NewChromatogramImport.ChromatogramImportDo, name='ChromatogramImportDo'),
    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/AddPeak', views.ChromatogramAddPeak, name='ChromatogramAddPeak'),

    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/OverwritePeaks', views.ChromatogramOverwritePeaks, name='ChromatogramOverwritePeaks'),
    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/OverwriteComment', views.ChromatogramSaveComment, name='ChromatogramSaveComment'),
    url(r'^Chromatogram/(?P<chromatogramid>[0-9]+)/OverwriteBaseline', views.ChromatogramOverwriteBaseline, name='ChromatogramOverwriteBaseline'),

    url(r'^api/HplcData/(?P<chromatogramid>[0-9]+)$', HplcDataForChromatogram, name='HplcData'),
    url(r'^api/HplcData/(?P<chromatogramid>[0-9]+)/(?P<timestamp>[0-9]*\.?[0-9]+)$', HplcDataSinceTimestamp, name='HplcDataSinceTimestamp'),
    url(r'^api/HplcDataForChromatogramSavitzkyGolay/(?P<chromatogramid>[0-9]+)/(?P<timestamp>[0-9]*\.?[0-9]+)/(?P<poly>[0-9]*\.?[0-9]+)/(?P<window>[0-9]*\.?[0-9]+)/(?P<deriv>[0-9]*\.?[0-9]+)$', HplcDataForChromatogramSavitzkyGolay, name='HplcDataForChromatogramSavitzkyGolay'),
    url(r'^api/Chromatogram/(?P<chromatogramid>[0-9]+)/delete', deleteChromatogram, name='DeleteChromatogram'),
    url(r'^api/Chromatogram/(?P<chromatogramid>[0-9]+)/SetDeadTime/(?P<DeadTime>[0-9]+)$', SetDeadTime, name='SetDeadTime'),
    url(r'^api/GetChromatogramsWithPeaksNamed/(?P<peakName>.+)', GetChromatogramsWithPeaksNamed, name='GetChromatogramsWithPeaksNamed'),

    url(r'^api/getColumns', getColumns, name='getColumns'),

    url(r'^api/AddMarker/(?P<chromatogramid>[0-9]+)$', AddMarker, name='AddMarker'),

    url(r'^api/Calibration/Delete/(?P<calibrationid>[0-9]+)$', JuHPLC.API.Calibration.delete, name='CalibrationDelete'),

    url(r'^Config', views.Config, name='Config'),


    url(r'^login/$', JuHPLC.Views.Login.loginMethod, name='login'),
    url(r'^accounts/login/$', JuHPLC.Views.Login.loginMethod, name='login'),
    url(r'^logout/$', JuHPLC.Views.Login.logoutMethod, name='logout'),


]