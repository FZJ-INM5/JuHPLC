from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# Create your models here.
import JuHPLC

from django.utils.dateparse import parse_datetime
from django.utils.encoding import force_str


class ISODateTimeField(models.DateTimeField):

    def strptime(self, value, format):
        return parse_datetime(force_str(value))


class Chromatogram(models.Model):

    class Meta:
        permissions = (
            ("chromatogram_edit", "Can edit a chromatograms data"),
            ("chromatogram_start", "Can start a chromatogram"),
            ("chromatogram_can_stop_others", "Can stop a chromatogram started by another user"),
            ("chromatogram_delete", "Can delete a chromatogram and all of its data")
        )
    Column = models.TextField()
    Datetime = models.FloatField()
    Flow = models.TextField()
    UVWavelength = models.TextField()
    Sample = models.TextField()
    InjectionVolume = models.TextField()
    Concentration = models.TextField()
    ConcentrationUnit = models.TextField()
    Comment = models.TextField()
    AcquireADC = models.BooleanField()
    DeadTime = models.IntegerField()
    FactorsUnits = models.TextField()
    ChannelOrderShift = models.TextField()
    MaxRuntime = models.IntegerField()
    RheodyneSwitch = models.BooleanField()
    SampleRate = models.IntegerField()
    NextChromatogram = models.IntegerField()
    HalfLife = models.FloatField()
    User = models.ForeignKey(User, on_delete=models.CASCADE)


class Eluent(models.Model):
    Chromatogram = models.ForeignKey(Chromatogram, on_delete=models.CASCADE)


class Solvent(models.Model):
    Name = models.TextField()
    Percentage = models.FloatField()
    Eluent = models.ForeignKey(Eluent, on_delete=models.CASCADE)


class HplcData(models.Model):
    Chromatogram = models.ForeignKey(Chromatogram, on_delete=models.CASCADE)
    ChannelName = models.TextField(db_index=True)
    Datetime = models.FloatField(db_index=True)
    Value = models.FloatField(db_index=True)

class Peak(models.Model):
    Chromatogram = models.ForeignKey(Chromatogram, on_delete=models.CASCADE)
    ChannelName = models.TextField()
    StartTime = models.IntegerField()
    EndTime = models.IntegerField()
    Name = models.TextField()

class Baseline(models.Model):
    Chromatogram = models.ForeignKey(Chromatogram, on_delete=models.CASCADE)
    ChannelName = models.TextField()
    DatetimeValue = models.TextField()
    Type = models.TextField()

class Calibration(models.Model):
    Name = models.TextField()
    Chromatograms = models.ManyToManyField(Chromatogram)
    Slope = models.FloatField()
    YAxisIntercept = models.FloatField()
    UVWaveLength = models.FloatField()
    Channel = models.TextField()
    Column = models.TextField()
    Flow = models.FloatField()
    RetentionFactor = models.FloatField()
    RetentionFactorError = models.FloatField()
    Eluent = models.TextField()
    Unit = models.TextField()

class Marker(models.Model):
    Chromatogram = models.ForeignKey(Chromatogram, on_delete=models.CASCADE)
    Time = models.IntegerField()
    Text = models.TextField()