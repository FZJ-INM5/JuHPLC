from django.contrib import admin

from .models import (
    Chromatogram,
    Eluent,
    Solvent,
    HplcData,
    Peak,
    Baseline,
    Calibration,
    Marker,
)


class ChromatogramAdmin(admin.ModelAdmin):
    list_display = ("id", "Sample", "Datetime", "User")


class EluentAdmin(admin.ModelAdmin):
    list_display = ("id", "Chromatogram")


class SolventAdmin(admin.ModelAdmin):
    list_display = ("Name", "Percentage", "Eluent")


class HplcDataAdmin(admin.ModelAdmin):
    list_display = ("id", "Chromatogram", "ChannelName", "Datetime", "Value")


class PeakAdmin(admin.ModelAdmin):
    list_display = ("Chromatogram", "ChannelName", "StartTime", "EndTime", "Name")


class BaselineAdmin(admin.ModelAdmin):
    list_display = ("Chromatogram", "ChannelName", "Type")


class CalibrationAdmin(admin.ModelAdmin):
    list_display = ("Name", "Slope", "YAxisIntercept", "Channel")


class MarkerAdmin(admin.ModelAdmin):
    list_display = ("Chromatogram", "Time", "Text")


admin.site.register(Chromatogram, ChromatogramAdmin)
admin.site.register(Eluent, EluentAdmin)
admin.site.register(Solvent, SolventAdmin)
admin.site.register(HplcData, HplcDataAdmin)
admin.site.register(Peak, PeakAdmin)
admin.site.register(Baseline, BaselineAdmin)
admin.site.register(Calibration, CalibrationAdmin)
admin.site.register(Marker, MarkerAdmin)
