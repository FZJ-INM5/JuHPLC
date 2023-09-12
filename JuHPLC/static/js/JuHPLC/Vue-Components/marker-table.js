Vue.component('marker-table', {
    props: {
        chromatogram: {}
    },
    template: '<div class="markerTable"><table class="table table-sm juhplcMarkerTable page-break-inside-avoid">\n' +
    '            <thead>\n' +
    '            <tr>\n' +
    '                <th>Time (minutes since start of measurement)</th>\n' +
    '                <th>Text</th>\n' +
    '            </tr>\n' +
    '            </thead>\n' +
    '            <tbody>\n' +
    '                <tr ' +
    '                     v-for="val in chromatogram.Data.Marker">' +
        '<td>{{val.Time/60}}</td>'+
        '<td>{{val.Text}}</td>'+
    '                </tr>' +
        '<tr>' +
    '       <td>' +
    '           <input type="text" v-on:keyup.enter="add_marker2(\'markerTextTmp2\',\'markerTextTmp2Time\')" style="width:30%" placeholder="Time to add marker (mm.ss)" id="markerTextTmp2Time" />' +
    '       </td>' +
    '       <td>' +
    '          <input v-on:keyup.enter="add_marker2(\'markerTextTmp2\',\'markerTextTmp2Time\')" type="text" placeholder="Text for new Marker" id="markerTextTmp2" /><input type="button" class="btn btn-success" value="Add" ' +
    '               v-on:click="add_marker2(\'markerTextTmp2\',\'markerTextTmp2Time\')"/>' +
    '       </td>' +
    '   </tr>'+
        '<tr>' +
    '       <td>' +
    '           ' +
    '       </td>' +
    '       <td>' +
    '          <input  v-on:keyup.enter="add_marker(\'markerTextTmp\')" type="text" placeholder="Text for new Marker at current time" id="markerTextTmp" /><input type="button" class="btn btn-success" value="Add" ' +
    '               v-on:click="add_marker(\'markerTextTmp\')"/>' +
    '       </td>' +
    '   </tr>'+
    '</tbody>\n' +
    '</table>' +
    '</div>',
    methods: {
        add_marker: function (elementId) {
            var text = $('#'+elementId).val();
            var time = Math.max.apply(null,Object.keys(this.chromatogram.Data.Data).map(x => {return this.chromatogram.Data.Data[x][0].length;}));
            var self = this;
            console.log("add_marker", text, time);

            var msg = JSON.stringify({
                    type: 'addMarker',
                    sender: window.channel_name,
                    Time: time,
                    Text:text
            });
            if(window.chatSocket.readyState == WebSocket.OPEN) {
                window.chatSocket.send(msg);
            } else {
                window.chatSocket.localMessage(msg);
	    }
            $('#'+elementId).clear();
        },
        add_marker2: function (elementIdText,elementIdTime) {
            var text = $('#'+elementIdText).val();
            var time = $('#'+elementIdTime).val();

            time = Math.round(parseFloat(time)*60*this.chromatogram.SampleRate);

            var msg = JSON.stringify({
                    type: 'addMarker',
                    sender: window.channel_name,
                    Time: time,
                    Text: text
            });
            if(window.chatSocket.readyState == WebSocket.OPEN) {
                window.chatSocket.send(msg);
            } else {
                window.chatSocket.localMessage(msg);
	    }

            $('#'+elementIdText).val("");
            $('#'+elementIdTime).val("");
        }
    },
    created() {
        console.log("marker-table");
        console.log(this);
        console.log(this.chromatogram);

    }
});
Vue.use("marker-table");
