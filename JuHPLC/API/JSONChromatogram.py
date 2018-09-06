import JuHPLC.API.Chromatogram
import JuHPLC.API.HplcData
from JuHPLC.models import Chromatogram, Eluent, Solvent, Peak, HplcData, Baseline
from django.db.models import Model

class JSONJuHPLCChromatogram(Model):

    def __init__(self, id):
        chrom = Chromatogram.objects.get(pk=id)

        self.id = id
        self.Flow = chrom.Flow
        self.Concentration = chrom.Concentration
        self.UVWaveLength = chrom.UVWavelength
        self.Comment = chrom.Comment
        self.DeadTime = chrom.DeadTime
        self.InjectionVolume = chrom.InjectionVolume
        self.Sample = chrom.Sample
        self.SampleRate = chrom.SampleRate
        self.ConcentrationUnit = chrom.ConcentrationUnit
        self.NextChromatogram = chrom.NextChromatogram
        self.RheodyneSwitch = chrom.RheodyneSwitch
        self.ChannelOrderShift = chrom.ChannelOrderShift
        self.Column = chrom.Column
        self.HalfLife = chrom.HalfLife

        self.Eluents = JSONJuHPLCEluent(Eluent.objects.filter(Chromatogram=chrom).all()).Solvents

        self.Data = {}

        self.Data["Factors"] = {}
        self.Data["Units"] = {}

        for i in chrom.FactorsUnits.split("\r\n"):
            channelname, factor, unit = i.split(" - ")

            self.Data["Factors"][channelname] = factor
            self.Data["Units"][channelname] = unit

        self.Data["Data"] = JSONJuHPLCData(chrom).Data
        self.Data["Peaks"] = JSONJuHPLCPeaks(chrom).Peaks
        self.Data["Baseline"] = JSONJuHPLCBaseline(chrom).Baseline
        if len(self.Data["Peaks"]) == 0:
            for i in self.Data["Data"]:
                self.Data["Peaks"][i] = []


class JSONJuHPLCData:

    def __init__(self, chromatogram):
        self.Data = {}

        d = HplcData.objects.filter(Chromatogram=chromatogram).all()
        tmpdata = {}
        for i in d:
            if i.ChannelName not in tmpdata:
                tmpdata[i.ChannelName] = []
                self.Data[i.ChannelName] = [[]]
            tmpdata[i.ChannelName].append(i)

        for i in tmpdata:
            tmpdata[i] = sorted(tmpdata[i], key=lambda s: s.Datetime)

        for i in tmpdata:
            for j in tmpdata[i]:
                self.Data[i][0].append(j.Value)


class JSONJuHPLCEluent:

    def __init__(self, eluents):
        self.Solvents = []
        for e in eluents:
            for s in Solvent.objects.filter(Eluent=e).all():
                self.Solvents.append(JSONJuHPLCSolvent(s.Name, s.Percentage,e.id).__dict__)


class JSONJuHPLCSolvent:

    def __init__(self, name, percentage, eluentId):
        self.Name = name
        self.Percentage = percentage
        self.EluentId = eluentId


class JSONJuHPLCPeak:

    def __init__(self, starttime, endtime, name, mode="default"):
        self.StartTime = starttime
        self.EndTime = endtime
        self.Mode = mode
        self.Name = name


class JSONJuHPLCPeaks:

    def __init__(self, chrom):
        self.Peaks = {}
        peaksData = Peak.objects.filter(Chromatogram=chrom).order_by("StartTime").all()

        peaksDataGrouped = {}

        for d in peaksData:
            if d.ChannelName not in peaksDataGrouped:
                peaksDataGrouped[d.ChannelName] = []

            peaksDataGrouped[d.ChannelName].append(JSONJuHPLCPeak(d.StartTime, d.EndTime, d.Name).__dict__)

        self.Peaks = peaksDataGrouped


class JSONJuHPLCBaseline:

    def __init__(self, chrom):
        self.Baseline = {}
        data = Baseline.objects.filter(Chromatogram=chrom).all()

        dataGrouped = {}

        for d in data:
            if (d.ChannelName not in dataGrouped):
                dataGrouped[d.ChannelName] = {}

            dataGrouped[d.ChannelName]['DatetimeValue'] = d.DatetimeValue
            dataGrouped[d.ChannelName]['Type'] = d.Type

        self.Baseline = dataGrouped
