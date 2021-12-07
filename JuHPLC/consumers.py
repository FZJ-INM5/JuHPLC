from channels.generic.websocket import AsyncWebsocketConsumer
import json
from asgiref.sync import sync_to_async

from JuHPLC.models import Chromatogram, Peak, Marker


class JuHPLCConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['id']
        self.room_group_name = 'ChromatogramDetails_%s' % self.room_name

        self.channel_name_prefix, self.channel_name_without_prefix = self.channel_name.split('!')
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # this creates the group names self.channel_name_without_prefix
        # allows to send messages to only this client and none else
        await self.channel_layer.group_add(
            self.channel_name_without_prefix,
            self.channel_name
        )

        # create the group self.room_group_name.NOT.self.channel_name_without_prefix
        # this allows to send messages to every subscriber except the current, aka the sender
        for i in self.channel_layer.groups[self.room_group_name]:
            ichannel_name_prefix, ichannel_name_without_prefix = i.split('!')
            for j in self.channel_layer.groups[self.room_group_name]:
                jchannel_name_prefix, jchannel_name_without_prefix = j.split('!')
                if i != j:
                    await self.channel_layer.group_add(
                        self.room_group_name + '.NOT.' + jchannel_name_without_prefix,
                        i
                    )
                    await self.channel_layer.group_add(
                        self.room_group_name + '.NOT.' + ichannel_name_without_prefix,
                        j
                    )

        await self.accept()

        await self.send(text_data=json.dumps({
            'message': "Registered Successfully!",
            'channel_name': self.channel_name,
            'type': 'registration'
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.channel_layer.group_discard(
            self.channel_name_without_prefix,
            self.channel_name
        )

        for g in self.channel_layer.groups:
            for channel in self.channel_layer.groups[g]:
                self.channel_layer.group_discard(
                    g+".NOT."+channel.split('!')[1],
                    self.channel_name
                )


    async def receive(self, text_data):
        text_data_json = json.loads(text_data)

        # send the new deadtime to everyone except the sender
        if text_data_json['type'] == 'setDeadTime':
            c = await sync_to_async(Chromatogram.objects.get,thread_sensitive=True)(pk=self.room_name)
            c.DeadTime = text_data_json['DeadTime']
            await sync_to_async(c.save)()

            await self.channel_layer.group_send(self.room_group_name + '.NOT.' + self.channel_name_without_prefix, {
                'message': {'DeadTime': text_data_json['DeadTime']},
                'type': 'hplc.setDeadTime'
            })

        if text_data_json['type'] == 'deletePeaks':
            c = await sync_to_async(Chromatogram.objects.get,thread_sensitive=True)(pk=self.room_name)
            await sync_to_async(Peak.objects.filter(Chromatogram=c).delete)()

            await self.channel_layer.group_send(self.room_group_name + '.NOT.' + self.channel_name_without_prefix, {
                'message': {},
                'type': 'hplc.deletePeaks'
            })

        if text_data_json['type'] == 'addPeak':
            c = await sync_to_async(Chromatogram.objects.get,thread_sensitive=True)(pk=self.room_name)
            p = Peak()
            p.ChannelName = text_data_json['channel']
            p.Chromatogram = c
            p.StartTime = text_data_json['data']["StartTime"]
            p.EndTime = text_data_json['data']["EndTime"]
            p.Name = text_data_json['data']["Name"]
            await sync_to_async(p.save)()

            await self.channel_layer.group_send(self.room_group_name + '.NOT.' + self.channel_name_without_prefix, {
                'message': {'channel':text_data_json['channel'],'data':text_data_json['data']},
                'type': 'hplc.addPeak'
            })

        if text_data_json['type'] == 'renamePeak':
            c = await sync_to_async(Chromatogram.objects.get,thread_sensitive=True)(pk=self.room_name)
            p = await sync_to_async(Peak.objects\
                .filter(Chromatogram=c)\
                .filter(StartTime=text_data_json['data']["StartTime"])\
                .filter(EndTime=text_data_json['data']["EndTime"])\
                .filter(ChannelName=text_data_json['channel']).first)()
            p.Name = text_data_json['data']["Name"]
            await sync_to_async(p.save)()

            await self.channel_layer.group_send(self.room_group_name + '.NOT.' + self.channel_name_without_prefix, {
                'message': text_data_json,
                'type': 'hplc.renamePeak'
            })

        if text_data_json['type'] == 'adjustPeak':
            c = Chromatogram.objects.get(pk=self.room_name)
            p = Peak.objects\
                .filter(Chromatogram=c)\
                .filter(StartTime=text_data_json['data']["beforeStartTime"])\
                .filter(EndTime=text_data_json['data']["beforeEndTime"])\
                .filter(ChannelName=text_data_json['channel']).first()
            p.StartTime = text_data_json['data']["StartTime"]
            p.EndTime = text_data_json['data']["EndTime"]
            p.save()

            await self.channel_layer.group_send(self.room_group_name + '.NOT.' + self.channel_name_without_prefix, {
                'message': text_data_json,
                'type': 'hplc.adjustPeak'
            })

        if text_data_json['type'] == 'removePeak':
            c = await sync_to_async(Chromatogram.objects.get,thread_sensitive=True)(pk=self.room_name)
            p = await sync_to_async(Peak.objects\
                .filter(Chromatogram=c)\
                .filter(StartTime=text_data_json['data']["StartTime"])\
                .filter(EndTime=text_data_json['data']["EndTime"])\
                .filter(ChannelName=text_data_json['channel']).first)()
            await sync_to_async(p.delete)()

            await self.channel_layer.group_send(self.room_group_name + '.NOT.' + self.channel_name_without_prefix, {
                'message': text_data_json,
                'type': 'hplc.removePeak'
            })

        if text_data_json['type'] == 'addMarker':

            c = await sync_to_async(Chromatogram.objects.get, thread_sensitive=True)(pk=self.room_name)
            m = Marker(Chromatogram=c, Time=text_data_json['Time'], Text=text_data_json['Text'])
            await sync_to_async(m.save)()

            await self.channel_layer.group_send(self.room_group_name, {
                'message': text_data_json,
                'type': 'hplc.addMarker'
            })

    async def hplc_data(self, message):
        await self.send(json.dumps(message))

    async def hplc_setDeadTime(self, message):
        await self.send(json.dumps(message))

    async def hplc_deletePeaks(self, message):
        await self.send(json.dumps(message))

    async def hplc_addPeak(self, message):
        await self.send(json.dumps(message))

    async def hplc_renamePeak(self, message):
        await self.send(json.dumps(message))

    async def hplc_adjustPeak(self, message):
        await self.send(json.dumps(message))

    async def hplc_removePeak(self, message):
        await self.send(json.dumps(message))

    async def hplc_addMarker(self, message):
        await self.send(json.dumps(message))

    async def hplc_nextChromatogram(self, message):
        await self.send(json.dumps(message))
