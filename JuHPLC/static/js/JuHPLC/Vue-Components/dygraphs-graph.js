Vue.component('dygraphs-graph', {
    props: {
        chromatogram: {},
        graphname: "",
        activePeakCopy:null
    },
    data() {
        return {
            _graph: null,
            waitingForUpdate: false,
        };
    },
    methods: {
        _drawPeak: function (c, peakIdx, g, canvas, bl) {
            var currentPeak = c.Data.Peaks[this.graphname][peakIdx];

            // only handle this for peaks that are within view to save computing time
            if (g.dateWindow_ != null) {
                if (g.dateWindow_[1] < currentPeak.StartTime || g.dateWindow_[0] > currentPeak.EndTime) {
                    //continue;
                }
            }

            var starttime = currentPeak.StartTime;
            var endtime = currentPeak.EndTime;
            var farbe = getColor(peakIdx, 0.5);

            if(starttime == endtime){
                endtime=starttime+1;
                currentPeak.EndTime=endtime;
            }

            if(starttime > endtime){
                let tmp = starttime;
                starttime=endtime;
                endtime=tmp;
            }



            var ctx = canvas;

            ctx.fillStyle = farbe;
            ctx.beginPath();


            if (c.Data.Baseline === undefined
                || c.Data.Baseline[this.graphname] === undefined) {

                var startidx = 0;

                for (var i3 = 0; i3 < g.rawData_.length; i3++) {
                    if (g.rawData_[i3][0] > starttime && g.rawData_[i3][0] <= endtime) {
                        startidx = Math.max(i3 - 1, 0);
                        break;
                    }
                }

                var tmp = g.toDomCoords(g.rawData_[startidx][0], g.rawData_[startidx][1]);
                ctx.moveTo(tmp[0], tmp[1]);

                for (var i3 = 0; i3 < g.rawData_.length; i3++) {
                    if (g.rawData_[i3][0] > starttime && g.rawData_[i3][0] <= endtime) {
                        tmp = g.toDomCoords(g.rawData_[i3][0], g.rawData_[i3][1]);
                        ctx.lineTo(tmp[0], tmp[1]);
                    }
                }
                tmp = g.toDomCoords(g.rawData_[startidx][0], g.rawData_[startidx][1]);
                ctx.lineTo(tmp[0], tmp[1]);
                ctx.closePath();
                ctx.fill();
            } else {
                var tmp = g.toDomCoords(starttime, bl.calculateAtPointX(starttime) * this.chromatogram.Data.Factors[this.graphname]);
                ctx.moveTo(tmp[0], tmp[1]);
                var tmp = g.toDomCoords(starttime, g.rawData_[starttime][1]);
                ctx.lineTo(tmp[0], tmp[1]);

                for (var i = starttime + 1; i <= endtime; i++) {
                    var tmp = g.toDomCoords(i, g.rawData_[i][1]);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                var tmp = g.toDomCoords(endtime, bl.calculateAtPointX(endtime) * this.chromatogram.Data.Factors[this.graphname]);
                ctx.lineTo(tmp[0], tmp[1]);
                for (var i = endtime; i >= starttime; i--) {
                    var tmp = g.toDomCoords(i, bl.calculateAtPointX(i) * this.chromatogram.Data.Factors[this.graphname]);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                ctx.closePath();
                ctx.fill();
            }
            return {currentPeak, starttime, endtime, farbe, ctx, startidx, i3, tmp, i3, tmp, tmp, i, tmp, tmp, i, tmp};
        },
        _drawPeakPreview: function (c, peakIdx, peakData, g, canvas, bl) {
            var currentPeak = peakData;

            // only handle this for peaks that are within view to save computing time
            if (g.dateWindow_ != null) {
                if (g.dateWindow_[1] < currentPeak.StartTime || g.dateWindow_[0] > currentPeak.EndTime) {
                    //continue;
                }
            }

            var starttime = currentPeak.StartTime;
            var endtime = currentPeak.EndTime;
            var farbe = getColor(peakIdx, 0.5);

            var factor = c.Data.Factors[this.graphname];

            var ctx = canvas;

            ctx.fillStyle = farbe;
            ctx.beginPath();


            if (c.Data.Baseline === undefined
                || c.Data.Baseline[this.graphname] === undefined) {

                var startidx = 0;

                for (var i3 = 0; i3 < g.rawData_.length; i3++) {
                    if (g.rawData_[i3][0] > starttime && g.rawData_[i3][0] <= endtime) {
                        startidx = Math.max(i3 - 1, 0);
                        break;
                    }
                }

                var tmp = g.toDomCoords(g.rawData_[startidx][0], g.rawData_[startidx][1]);
                ctx.moveTo(tmp[0], tmp[1]);

                for (var i3 = 0; i3 < g.rawData_.length; i3++) {
                    if (g.rawData_[i3][0] > starttime && g.rawData_[i3][0] <= endtime) {
                        tmp = g.toDomCoords(g.rawData_[i3][0], g.rawData_[i3][1]);
                        ctx.lineTo(tmp[0], tmp[1]);
                    }
                }
                tmp = g.toDomCoords(g.rawData_[startidx][0], g.rawData_[startidx][1]);
                ctx.lineTo(tmp[0], tmp[1]);
                ctx.closePath();
                ctx.fill();
            } else {
                var tmp = g.toDomCoords(starttime, bl.calculateAtPointX(starttime) * factor);
                ctx.moveTo(tmp[0], tmp[1]);
                var tmp = g.toDomCoords(starttime, g.rawData_[starttime][1]);
                ctx.lineTo(tmp[0], tmp[1]);

                for (var i = starttime + 1; i <= endtime; i++) {
                    var tmp = g.toDomCoords(i, g.rawData_[i][1]);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                var tmp = g.toDomCoords(endtime, bl.calculateAtPointX(endtime) * factor);
                ctx.lineTo(tmp[0], tmp[1]);
                for (var i = endtime; i >= starttime; i--) {
                    var tmp = g.toDomCoords(i, bl.calculateAtPointX(i) * factor);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                ctx.closePath();
                ctx.fill();
            }
            return {currentPeak, starttime, endtime, farbe, ctx, startidx, i3, tmp, i3, tmp, tmp, i, tmp, tmp, i, tmp};
        },
        juhplcdygraphsUnderlayCallback: function (canvas, area, g) {
            let c = this.chromatogram;
            var baseLine = {};
            if (c === undefined || this.graphname === undefined) {
                //we don't know our own name as of yet, so return and force a re-rendering afterwards
                console.debug("<dygraphs-graph>: waiting for chromatogram and graphname to be set");
                console.debug("<dygraphs-graph>", g);
                setTimeout(function () {
                    g.updateOptions({}, false);
                }, 5000);
                return;
            }


			var marker = c.Data.Marker;

            //draw window.chromatogram.DeadTime here if is set
            if (c.DeadTime != -1) {
                var bottom_left = g.toDomCoords(c.DeadTime, -200000);
                var top_right = g.toDomCoords(c.DeadTime + 0.1, +200000);
                top_right[0] = bottom_left[0] + 1;
                var left = bottom_left[0];
                var right = top_right[0];
                canvas.fillStyle = "rgba(255, 0, 0, 0.5)";
                canvas.fillRect(left, area.y, right - left, area.h);
            }
            //end draw window.chromatogram.DeadTime

			for(var i=0;i<marker.length;i++){
				var res = marker[i].Time;
				var bottom_left = g.toDomCoords(res, -200000);
                var top_right = g.toDomCoords(res + 500, i*10);
                top_right[0] = bottom_left[0] + 1.5;
                var left = bottom_left[0];
                var right = top_right[0];
                canvas.fillStyle = "rgba(255, 0, 0, 1)";
                //canvas.fillRect(left, area.y, right - left, area.h);
				canvas.fillRect(left, 10*(i+1), right - left, area.h);


				canvas.font="11px Arial";
				canvas.fillText(marker[i].Text,bottom_left[0]+5,11*(i+1));
			}



            //get baseline object
            if (c.Data.Baseline !== undefined
                && c.Data.Baseline[this.graphname] !== undefined) {
                baseLine = new Baseline(c.Data.Baseline[this.graphname]);
            }
            //end get baseline object

            //draw the peaks
            if (c.Data.Peaks != null
                && c.Data.Peaks[this.graphname] != null
                && c.Data.Peaks[this.graphname].length > 0) {
                for (var peakIdx = 0; peakIdx < c.Data.Peaks[this.graphname].length; peakIdx++) {
                    this._drawPeak(c, peakIdx, g, canvas, baseLine);
                }

            }


        },
        juhplcdygraphsDrawCallback: function (g, is_initial) {


            //console.log("Draw Call");
            var c = this.chromatogram;
            var bl = c.Data.Baseline;

            //we have no data for the baseline yet, so we can't draw anything of it yet.
            //todo: maybe add a fallback for linear baseline from 0|f(0) to x_max|f(x_max)
            if (bl[this.graphname] === undefined)
                return;

            var bl = new Baseline(bl[this.graphname]);

            var ctx = g.hidden_ctx_; //using hidden-context instead of

            if (this.$root.$data.editBaseline) {

                var data = bl.getValues();
                for (var i = 0; i < data[0].length; i++) {
                    //console.log(i);

                    ctx.beginPath();
                    var tmp = g.toDomCoords(data[0][i], data[1][i] * this.chromatogram.Data.Factors[this.graphname]);
                    ctx.arc(tmp[0], tmp[1], 3, 0, 2 * Math.PI);
                    ctx.fillStyle = "black";
                    ctx.fill();
                }
            }


            ctx.beginPath();
            if (!this.$root.$data.editBaseline) {
                ctx.fillStyle = "green";
                ctx.lineWidth = 0.2;
            }
            var tmp = g.toDomCoords(0, 0);
            ctx.moveTo(tmp[0], tmp[1]);

            for (var i = 0; i < g.rawData_.length - 1; i++) {
                tmp = g.toDomCoords(g.rawData_[i][0], bl.calculateAtPointX(g.rawData_[i][0]) * this.chromatogram.Data.Factors[this.graphname]);
                ctx.lineTo(tmp[0], tmp[1]);
            }

            ctx.stroke();

            //console.log("End Draw Call");


        },
        _getAnnotations: function () {
            let c = this.chromatogram;

            let annotations = [];

            //for var i=0;i<c.Data.Peaks[graphname].length;i++ does NOT work. magic?
            for (var i in c.Data.Peaks[this.graphname]) {
                var curr = c.Data.Peaks[this.graphname][i];
                var x = new SavitzkyGolayPeak(c.Data.Data[this.graphname], curr.StartTime, curr.EndTime, this.graphname, this.chromatogram).getPeakMaximumProjected().f_x;
                var shorttext = "";

                if (curr.Name === undefined || curr.Name.length === 0 || curr.Name === "undefined") {
                    shorttext = i;
                } else {
                    shorttext = curr.Name;
                }
                let myCssClass = "";
                if(typeof(curr.active) !== 'undefined' && curr.active){

                    myCssClass = "annotationActive";
                }

                annotations.push({
                    series: this.graphname,
                    x: "" + x,
                    shortText: shorttext,
                    text: curr.Name,
                    tickHeight: 10,
                    width: shorttext.length * 9 + 10,
                    cssClass:myCssClass
                });
            }
            return annotations;

        },
        _refreshGraph: function (options) {

            var opt = (typeof options === 'undefined') ? {"keepXAxis": false, "keepYAxis": false} : options;

            let g = this.$data._graph;
            let c = this.chromatogram;

            var annotations = this._getAnnotations();

            var graphOptions = {};

            if (opt.keepXAxis)
                graphOptions.dateWindow = g.dateWindow_;
            if (opt.keepYAxis && g.isZoomed()) {
                graphOptions.valueRange = g.yAxisRange();
                if (g.dateWindow_ != null
                    && (g.dateWindow_[0] != g.xAxisRange()[0]
                        && g.dateWindow_[1] != g.xAxisRange()[1])) {
                    graphOptions.dateWindow = [1, c.Data.dygraphsData[graphname].length - 1];
                } else {
                    graphOptions.dateWindow = g.dateWindow_;
                }
            } else {
                graphOptions.valueRange = null;
            }
            graphOptions.file = transformDataToArray(this.chromatogram, this.graphname);
            let widthfactor=0.990;
            if(window.matchMedia("print").matches){
                widthfactor = 1;
            }
            g.resize($('body').width()*widthfactor, $('#dygraphs-graph' + this._uid).parent().height());

            $('#fii').innerHtml = $($('.peakTable').children()[1]).width();

            //setAnnotations has to be down here since it causes a refresh of the rendering
            //todo: set this elsewhere e.g. in updateOptions, documentations doesn't cover this case

            g.setAnnotations(annotations);
            g.updateOptions(graphOptions, false);


        },
        _disableContextmenuOnRightclick: function () {
            $('#dygraphs-graph' + this._uid).contextmenu(function () {
                return false;
            });
        },
        zoomIntoPeak: function (peakid) {
            var p = this.chromatogram.Data.Peaks[this.graphname][peakid];
            var g = this.$data._graph;

            g.updateOptions({dateWindow: [p.StartTime - 20 * this.chromatogram.SampleRate, p.EndTime + 20 * this.chromatogram.SampleRate]}, false);
        },
        highlightCallback: function (event, x, points, row, seriesName) {
            app.$eventHub.$emit('setSelection', {x: x, series: this.graphname});
        },
        unhighlightCallback: function (event) {
            app.$eventHub.$emit('clearSelection', {});
        },
        annotationClickHandler:function(annotation,point,dygraph,event){ // get the peak which was clicked by filtering for the name, starttime and endtime
                var currentPeak = dygraph.chromatogram.Data.Peaks[dygraph.graphname]
                    .filter(x => {
                        return x.Name === annotation.text
                        && annotation.x <= x.EndTime
                        && annotation.x >= x.StartTime;
                    })[0];

                //set all other peaks that might be active to inactive
                dygraph.chromatogram.Data.Peaks[dygraph.graphname]
                    .filter(x => {
                        return x.active && x.StartTime != currentPeak.StartTime && x.EndTime != currentPeak.EndTime;
                    }).map(x => {
                        x.active=false;
                        return true;
                    });

                //get the index of currentPeak
                var idx = dygraph.chromatogram.Data.Peaks[dygraph.graphname].indexOf(currentPeak);

                //update the active flag on the peak using vue.js's set method. if id doesn't exist yet, set it to true.
                // if it does exist, toggle it
                if(typeof(dygraph.chromatogram.Data.Peaks[dygraph.graphname][idx].active) === 'undefined') {
                    Vue.set(dygraph.chromatogram.Data.Peaks[dygraph.graphname][idx], 'active', true);
                }else{
                    Vue.set(dygraph.chromatogram.Data.Peaks[dygraph.graphname][idx], 'active', !dygraph.chromatogram.Data.Peaks[dygraph.graphname][idx].active);
                }

                if(dygraph.chromatogram.Data.Peaks[dygraph.graphname][idx].active){
                    dygraph.vueObject.activePeakCopy = currentPeak;
                    dygraph.vueObject.activePeakCopy.beforeStartTime=currentPeak.StartTime;
                    dygraph.vueObject.activePeakCopy.beforeEndTime=currentPeak.EndTime;
                }else{
                    dygraph.vueObject.activePeakCopy = null;
                }

                // do more with it, currently debug logging
                console.log(annotation);
                console.log(point);
                console.log(dygraph);
                console.log(event);
        }
    },
    mounted() {
        this.interactionModel = {
            // Track the beginning of drag events
            mousedown: function mousedown(event, g, context) {
                // Right-click should not initiate a zoom.
                if (event.button && event.button == 2 && g.$rootData.editBaseline) {
                    g.vueObject.interactionModel.click(event, g, context);
                }

                context.initializeMouseDown(event, g, context);

                if (g.$rootData.editDeadTime) {
                    //SetDeadTime.call(g, g.toDataXCoord(context.dragStartX));
                    this.chromatogram.DeadTime = Math.round(g.toDataXCoord(context.dragStartX));

                    //cleanup
                    context.dragEndX = context.dragEndY = null;
                    context.destroy();
                    //endcleanup

                    var msg = JSON.stringify({
                            type: 'setDeadTime',
                            sender: window.channel_name,
                            DeadTime: this.chromatogram.DeadTime
                    });
                    
		    if(window.chatSocket.readyState == WebSocket.OPEN) {
			window.chatSocket.send(msg);
		    } else {
                        window.chatSocket.onmessage(msg);
		    }

                    return;
                }

                if (event.altKey || event.shiftKey) {
                    Dygraph.startPan(event, g, context);
                } else {
                    Dygraph.startZoom(event, g, context);
                }

                // Note: we register mousemove/mouseup on document to allow some leeway for
                // events to move outside of the chart. Interaction model events get
                // registered on the canvas, which is too small to allow this.
                var mousemove = function mousemove(event) {
                    if (context.isZooming) {
                        // When the mouse moves >200px from the chart edge, cancel the zoom.

                        var d = distanceFromChart(event, g);
                        var c = g.chromatogram;

                            if (event.buttons == 1) {
                                Dygraph.moveZoom(event, g, context);
                            } else {

                                g.clearZoomRect_();
                                Dygraph.moveZoom(event, g, context);
                                var baseLine = null;
                                //get baseline object
                                if (c.Data.Baseline !== undefined
                                    && c.Data.Baseline[g.graphname] !== undefined) {
                                    baseLine = new Baseline(c.Data.Baseline[g.graphname]);
                                }
                                //end get baseline object


                                var start = Math.round(g.toDataXCoord(context.dragStartX));
                                var end = Math.round(g.toDataXCoord(context.dragEndX));


                                if(g.vueObject.activePeakCopy != null){
                                    console.log("clientX",event.clientX,"start:",g.vueObject.activePeakCopy.StartTime,"ende:",g.vueObject.activePeakCopy.EndTime);
                                    if(Math.abs(start-g.vueObject.activePeakCopy.beforeStartTime) < Math.abs(start-g.vueObject.activePeakCopy.beforeEndTime)){
                                        g.vueObject.activePeakCopy.StartTime=end;
                                    }else{
                                        g.vueObject.activePeakCopy.EndTime=end;
                                    }

                                }else{
                                    if (start > end) {
                                        var tmp = end;
                                        end = start;
                                        start = tmp;
                                    }
                                    let idx = 0;
                                    if(typeof(c.Data.Peaks[g.graphname]) !== 'undefined'){
                                        idx=c.Data.Peaks[g.graphname].length;
                                    }

                                    g._drawPeakPreview(c, idx, {
                                        "StartTime": start,
                                        "EndTime": end,
                                        "Mode": "default",
                                        "Name": "undefined"
                                    }, g, g.canvas_ctx_, baseLine);
                                }
                            }



                    } else if (context.isPanning) {
                        console.log("panning");
                        Dygraph.movePan(event, g, context);
                    }
                };
                var mouseup = function mouseup(event) {
                    if (context.isZooming) {
                        if (context.dragEndX !== null) {
                            if (event.button == 2 && !g.$rootData.editBaseline) {

                                var start = Math.round(g.toDataXCoord(context.dragStartX));
                                var end = Math.round(g.toDataXCoord(context.dragEndX));

                                //swap if integrating from right to left
                                if (end < start) {
                                    end = Math.round(g.toDataXCoord(context.dragStartX));
                                    start = Math.round(g.toDataXCoord(context.dragEndX));
                                }

                                //check if we already have a Peaks object, if not, set it to an empty list
                                if (g.chromatogram.Data.Peaks == null) {
                                    Vue.set(g.chromatogram.Data, "Peaks", []);
                                }

                                //check if we already have Peaks for this graph, if not, set it to an empty list
                                if (g.chromatogram.Data.Peaks[g.graphname] == null) {
                                    Vue.set(g.chromatogram.Data.Peaks, g.graphname, []);
                                }

                                 if(g.vueObject.activePeakCopy != null){
                                    var msg = JSON.stringify({
                                        type: 'adjustPeak',
                                        channel: g.graphname,
                                        data:g.vueObject.activePeakCopy
                                    });
		                    if(window.chatSocket.readyState == WebSocket.OPEN) {
                        		window.chatSocket.send(msg);
                    		    } else {
                        		window.chatSocket.onmessage(msg);
                    		    }
                                    g.vueObject.activePeakCopy.beforeStartTime=g.vueObject.activePeakCopy.StartTime;
                                    g.vueObject.activePeakCopy.beforeEndTime=g.vueObject.activePeakCopy.EndTime;

                                }else {
                                     console.log("adding peak from ", start, " to ", end, " to graph ", g.graphname);

                                     g.chromatogram.Data.Peaks[g.graphname].push({
                                         "StartTime": start,
                                         "EndTime": end,
                                         "Mode": "default",
                                         "Name": "undefined"
                                     });
                                     var msg = JSON.stringify({
                                          type: 'addPeak',
                                          channel: g.graphname,
                                          data:{
                                              "StartTime": start,
                                              "EndTime": end,
                                              "Mode": "default",
                                              "Name": "undefined"
                                          }
                                     });

		                    if(window.chatSocket.readyState == WebSocket.OPEN) {
                        		window.chatSocket.send(msg);
                    		    } else {
                        		window.chatSocket.onmessage(msg);
                    		    }
                                 }



                                g.vueObject.$eventHub.$emit('renamePeaksForCalibration');

                                context.dragEndX = null;
                                context.dragEndY = null;
                                g.clearZoomRect_();

                                context.destroy();
                                return;
                            }
                            if (g.$rootData.editBaseline) {
                                context.dragEndX = null;
                                context.dragEndY = null;
                                g.clearZoomRect_();


                                Dygraph.endZoom(event, g, context);
                                context.destroy();

                                return;
                            }

                            var direction = context.dragDirection;
                            Dygraph.endZoom(event, g, context);
                            if (direction == 1) {
                                var start = g.dateWindow_[0] / 60;
                                var end = g.dateWindow_[1] / 60;

                                console.log(g.dateWindow_);

                                if (start < end) {
                                    app.$eventHub.$emit('setScaleX', {min: start, max: end});
                                } else {
                                    app.$eventHub.$emit('setScaleX', {min: end, max: start});
                                }
                            }
                        } else {
                            //maybeTreatMouseOpAsClick(event, g, context);
                        }
                    } else if (context.isPanning) {
                        Dygraph.endPan(event, g, context);
                    }

                    document.removeEventListener('mousemove', mousemove, false);
                    document.removeEventListener('mouseup', mouseup, false);

                    context.destroy();
                };

                g.addAndTrackEvent(document, 'mousemove', mousemove);
                g.addAndTrackEvent(document, 'mouseup', mouseup);
            },
            click: function (event, g, context) {
                context.initializeMouseDown(event, g, context);
                if (!g.$rootData.editBaseline)
                    return;
                var wcd = g.chromatogram.Data;

                if (!wcd.Baseline.hasOwnProperty(g.graphname)) {
                    Vue.set(wcd.Baseline, g.graphname, {
                        DatetimeValue: "",
                        Type: "linear"
                    });
                }
                var currentBaseline = wcd.Baseline[g.graphname];

                if (context.regionWidth < 10 || context.dragEndX == undefined) {//we don't want to handle zooming actions here
                    var x = g.toDataXCoord(context.dragStartX);
                    var y = g.toDataYCoord(context.dragStartY) / g.chromatogram.Data.Factors[g.graphname];

                    if (isNaN(x) || isNaN(y))
                        return;

                    console.log(event);
                    if (context.regionWidth == 0) { //check if exact pair is already in the list. if so, we just added it during a dblclick event, so we remove it instead
                        //currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue,x, y);
                    }

                    if (event.button === 2) { //right click, so remove closest point
                        console.log("removing point near x:" + x + " y:" + y);
                        currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue, g, x, y);
                    }
                    if (event.button == 0) {
                        console.log("adding baseline point ", x, y);

                        if (currentBaseline.DatetimeValue.length == 0) {
                            currentBaseline.DatetimeValue += "" + x + "," + y
                        } else {
                            currentBaseline.DatetimeValue += "," + x + "," + y
                        }
                        currentBaseline.DatetimeValue = sortBaselineString(currentBaseline.DatetimeValue);
                    }
                    console.log(context);
                    console.log(event);
                }

            },
            willDestroyContextMyself: true,

            touchstart: function touchstart(event, g, context) {
                event.preventDefault();  // touch browsers are all nice.
                if (event.touches.length > 1) {
                    // If the user ever puts two fingers down, it's not a double tap.
                    context.startTimeForDoubleTapMs = null;
                }

                var touches = [];
                for (var i = 0; i < event.touches.length; i++) {
                    var t = event.touches[i];
                    // we dispense with 'dragGetX_' because all touchBrowsers support pageX
                    touches.push({
                        pageX: t.pageX,
                        pageY: t.pageY,
                        dataX: g.toDataXCoord(t.pageX),
                        dataY: g.toDataYCoord(t.pageY)
                        // identifier: t.identifier
                    });
                }
                context.initialTouches = touches;

                if (touches.length == 1) {
                    // This is just a swipe.
                    context.initialPinchCenter = touches[0];
                    context.touchDirections = {x: true, y: true};
                } else if (touches.length >= 2) {
                    // It's become a pinch!
                    // In case there are 3+ touches, we ignore all but the "first" two.

                    // only screen coordinates can be averaged (data coords could be log scale).
                    context.initialPinchCenter = {
                        pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
                        pageY: 0.5 * (touches[0].pageY + touches[1].pageY),

                        // TODO(danvk): remove
                        dataX: 0.5 * (touches[0].dataX + touches[1].dataX),
                        dataY: 0.5 * (touches[0].dataY + touches[1].dataY)
                    };

                    // Make pinches in a 45-degree swath around either axis 1-dimensional zooms.
                    var initialAngle = 180 / Math.PI * Math.atan2(
                        context.initialPinchCenter.pageY - touches[0].pageY,
                        touches[0].pageX - context.initialPinchCenter.pageX);

                    // use symmetry to get it into the first quadrant.
                    initialAngle = Math.abs(initialAngle);
                    if (initialAngle > 90) initialAngle = 90 - initialAngle;

                    context.touchDirections = {
                        x: (initialAngle < (90 - 45 / 2)),
                        y: (initialAngle > 45 / 2)
                    };
                }

                // save the full x & y ranges.
                context.initialRange = {
                    x: g.xAxisRange(),
                    y: g.yAxisRange()
                };
            },
            touchmove: function touchmove(event, g, context) {
                // If the tap moves, then it's definitely not part of a double-tap.
                context.startTimeForDoubleTapMs = null;

                var i, touches = [];
                for (i = 0; i < event.touches.length; i++) {
                    var t = event.touches[i];
                    touches.push({
                        pageX: t.pageX,
                        pageY: t.pageY
                    });
                }
                var initialTouches = context.initialTouches;

                var c_now;

                // old and new centers.
                var c_init = context.initialPinchCenter;
                if (touches.length == 1) {
                    c_now = touches[0];
                } else {
                    c_now = {
                        pageX: 0.5 * (touches[0].pageX + touches[1].pageX),
                        pageY: 0.5 * (touches[0].pageY + touches[1].pageY)
                    };
                }

                // this is the "swipe" component
                // we toss it out for now, but could use it in the future.
                var swipe = {
                    pageX: c_now.pageX - c_init.pageX,
                    pageY: c_now.pageY - c_init.pageY
                };
                var dataWidth = context.initialRange.x[1] - context.initialRange.x[0];
                var dataHeight = context.initialRange.y[0] - context.initialRange.y[1];
                swipe.dataX = (swipe.pageX / g.plotter_.area.w) * dataWidth;
                swipe.dataY = (swipe.pageY / g.plotter_.area.h) * dataHeight;
                var xScale, yScale;

                // The residual bits are usually split into scale & rotate bits, but we split
                // them into x-scale and y-scale bits.
                if (touches.length == 1) {
                    xScale = 1.0;
                    yScale = 1.0;
                } else if (touches.length >= 2) {
                    var initHalfWidth = (initialTouches[1].pageX - c_init.pageX);
                    xScale = (touches[1].pageX - c_now.pageX) / initHalfWidth;

                    var initHalfHeight = (initialTouches[1].pageY - c_init.pageY);
                    yScale = (touches[1].pageY - c_now.pageY) / initHalfHeight;
                }

                // Clip scaling to [1/8, 8] to prevent too much blowup.
                xScale = Math.min(8, Math.max(0.125, xScale));
                yScale = Math.min(8, Math.max(0.125, yScale));

                var didZoom = false;
                if (context.touchDirections.x) {
                    g.dateWindow_ = [
                        c_init.dataX - swipe.dataX + (context.initialRange.x[0] - c_init.dataX) / xScale,
                        c_init.dataX - swipe.dataX + (context.initialRange.x[1] - c_init.dataX) / xScale
                    ];
                    didZoom = true;
                }

                if (context.touchDirections.y) {
                    for (i = 0; i < 1  /*g.axes_.length*/; i++) {
                        var axis = g.axes_[i];
                        var logscale = g.attributes_.getForAxis("logscale", i);
                        if (logscale) {
                            // TODO(danvk): implement
                        } else {
                            axis.valueRange = [
                                c_init.dataY - swipe.dataY + (context.initialRange.y[0] - c_init.dataY) / yScale,
                                c_init.dataY - swipe.dataY + (context.initialRange.y[1] - c_init.dataY) / yScale
                            ];
                            didZoom = true;
                        }
                    }
                }

                g.drawGraph_(false);

                // We only call zoomCallback on zooms, not pans, to mirror desktop behavior.
                if (didZoom && touches.length > 1 && g.getFunctionOption('zoomCallback')) {
                    var viewWindow = g.xAxisRange();
                    g.getFunctionOption("zoomCallback").call(g, viewWindow[0], viewWindow[1], g.yAxisRanges());
                }
            },
            touchend: function touchend(event, g, context) {
                if (event.touches.length !== 0) {
                    // this is effectively a "reset"
                    DygraphInteraction.startTouch(event, g, context);
                } else if (event.changedTouches.length == 1) {
                    // Could be part of a "double tap"
                    // The heuristic here is that it's a double-tap if the two touchend events
                    // occur within 500ms and within a 50x50 pixel box.
                    var now = new Date().getTime();
                    var t = event.changedTouches[0];
                    if (context.startTimeForDoubleTapMs &&
                        now - context.startTimeForDoubleTapMs < 500 &&
                        context.doubleTapX && Math.abs(context.doubleTapX - t.screenX) < 50 &&
                        context.doubleTapY && Math.abs(context.doubleTapY - t.screenY) < 50) {
                        g.resetZoom();
                    } else {
                        context.startTimeForDoubleTapMs = now;
                        context.doubleTapX = t.screenX;
                        context.doubleTapY = t.screenY;
                    }
                }
            },

            // Disable zooming out if panning.
            dblclick: function dblclick(event, g, context) {
                if (context.cancelNextDblclick) {
                    context.cancelNextDblclick = false;
                    return;
                }

                if (g.$rootData.editBaseline) {
                    var wcd = window.juhplc.chromatogram.Data;
                    var currentBaseline = wcd.Baseline[g.juHPLCName];
                    currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue, g, context.dragStartX, context.dragStartY);
                    currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue, g, context.dragStartX, context.dragStartY);
                    g.resetZoom();
                    return;
                }

                // Give plugins a chance to grab this event.
                var e = {
                    canvasx: context.dragEndX,
                    canvasy: context.dragEndY
                };
                if (g.cascadeEvents_('dblclick', e)) {
                    return;
                }

                if (event.altKey || event.shiftKey) {
                    return;
                }
                g.resetZoom();

                app.$eventHub.$emit('resetZoom');

            }
        };

        //we want a higher pixel-ratio for better printing results
        var pixelratio = 1;
        if (location.search.substr(1) == "print=true")
            pixelratio = 4;

        this.$data._graph = new Dygraph('dygraphs-graph' + this._uid, transformDataToArray(this.chromatogram, this.graphname), {
            animatedZooms: false,
            labelsDiv: 'dygraphs-graph-label' + this._uid,
            legend: 'always',
            underlayCallback: this.juhplcdygraphsUnderlayCallback,
            drawCallback: this.juhplcdygraphsDrawCallback,
            highlightCallback: this.highlightCallback,
            unhighlightCallback: this.unhighlightCallback,
            interactionModel: this.interactionModel,
            annotationClickHandler:this.annotationClickHandler,
            ylabel: this.graphname + "( " + this.chromatogram.Data.Units[this.graphname] + " )",
            axes: {
                x: {
                    axisLabelFormatter: (x) => secondsMinutes(x, this.chromatogram.SampleRate),
                    valueFormatter: (x) => secondsMinutes(x, this.chromatogram.SampleRate),
                    ticker: (min, max, pixels, opts, dygraph, vals) => getXAxisTicks(min, max, pixels, opts, dygraph, vals, this.chromatogram.SampleRate)
                }
            },
            labels: ["x", this.graphname],
            pixelRatio: pixelratio,
            showRoller:true
        });

        this.$data._graph._drawPeakPreview = this._drawPeakPreview;

        this.$data._graph.$rootData = this.$root.$data;
        this.$data._graph.chromatogram = this.chromatogram;
        this.$data._graph.graphname = this.graphname;
        this.$data._graph.vueObject = this;
        this.$data._graph.setAnnotations(this._getAnnotations());

        window.anygraph = this.$data._graph;
        /**
         * Autorefresh on new/changed Peaks
         */
        this.$watch(() => chromatogram.Data.Peaks[this.graphname],
            () => this._refreshGraph({
                keepXAxis: true,
                keepYAxis: true
            }), {
                deep: true
            });

        /**
         * Autorefresh on new Markers if module enabled
         */
        this.$watch(() => chromatogram.Data.Marker,
            () => this._refreshGraph({
                keepXAxis: true,
                keepYAxis: true
            }), {
                deep: true
            });

        /**
         * Autorefresh on new Data
         */
        this.$watch(() => chromatogram.Data.Data[this.graphname][0],
            () => {
                delete this.chromatogram.tmp;
                this._refreshGraph({
                    keepXAxis: true,
                    keepYAxis: true
                });
            }, {
                deep: true
            });


        /**
         * refresh on new DeadTime
         */
        this.$watch(() => chromatogram.DeadTime, this._refreshGraph, {});

        /**
         * Refresh on changing Baseline edit mode
         */
        this.$watch(() => this.$root.$data.editBaseline, () => this._refreshGraph({
            keepXAxis: true,
            keepYAxis: true
        }), {});


        /**
         * Refresh when baseline changes
         */
        this.$watch(() => this.chromatogram.Data.Baseline[this.graphname], () => {
            this._refreshGraph({
                keepXAxis: true,
                keepYAxis: true
            });
        }, {deep: true});

        /**
         * Handle "resizeGraphs" event on $eventHub
         */
        this.$eventHub.$on('resizeGraphs', () => {
                this._refreshGraph({
                    keepXAxis: true,
                    keepYAxis: true
                });
                this.$data._graph.resize();
            }
        );

        this.$eventHub.$on('renamePeaksForCalibration', () => {
            if (typeof(this.$data._graph.chromatogram.calibration) === 'undefined')
                return;
            for (var i = 0; i < this.chromatogram.Data.Peaks[this.graphname].length; i++) {
                var result = this.$data._graph.chromatogram.Data.Peaks[this.graphname];
                var peak = new SavitzkyGolayPeak(this.$data._graph.chromatogram.Data.Data[this.graphname], result[i].StartTime, result[i].EndTime, this.graphname, this.chromatogram);
                var retentionFactor = peak.calculate_retention_factor(this.$data._graph.chromatogram.DeadTime);
                for (var j = 0; j < this.chromatogram.calibration.length; j++) {
                    var currCal = this.chromatogram.calibration[j].fields;

                    if (retentionFactor >= (currCal.RetentionFactor - currCal.RetentionFactorError)
                        && retentionFactor <= (currCal.RetentionFactor + currCal.RetentionFactorError)
                        && this.graphname == currCal.Channel) {
                        //we have a matching peak in our calibration table - name the peak accordingly
                        result[i].Name = currCal.Name;
                    }
                }
            }
        });

        this.$eventHub.$on('setSelection', (x) => {
                //console.debug("<dygraphs-graph> - "+this.graphname+":setSelection");
                this.$data._graph.setSelection(this.$data._graph.getRowForX(x.x));
            }
        );

        this.$eventHub.$on('clearSelection', (x) => {
                this.$data._graph.clearSelection();
            }
        );

        this.$eventHub.$on('zoomIntoPeak', (x) => {
                if (x.channelName === this.graphname) {
                    this.zoomIntoPeak(x.peakId);
                }
            }
        );

        this.$eventHub.$on('resetZoom', () => {
            this.$data._graph.resetZoom();
        });

        this.$eventHub.$on('setColor', (x) => {
            if (x.channelName == this.graphname) {
                if (this.$data._graph.colors_[0] != x.color) {
                    console.log("setting new color ", x.color, " on ", x.channelName);
                    this.$data._graph.updateOptions({color: x.color});
                }
            }
        });

        this.$eventHub.$on('setScaleY', (x) => {
            if (x.channelName == this.graphname) {
                console.log("<dygraphs-graph>setScaleY:", x);
                var pmin = parseFloat(x.min);
                var pmax = parseFloat(x.max);
                if (pmin > pmax) {
                    this.$data._graph.updateOptions({
                        valueRange: [pmax, pmin]
                    }, false);
                } else {
                    this.$data._graph.updateOptions({
                        valueRange: [pmin, pmax]
                    }, false);

                }
            }
        });

        this.$eventHub.$on('setScaleX', (x) => {

            console.log("<dygraphs-graph>setScaleX:", x);
            var pmin = parseFloat(x.min);
            var pmax = parseFloat(x.max);
            if (pmin > pmax) {
                this.$data._graph.updateOptions({
                    dateWindow: [60 * pmax * this.chromatogram.SampleRate, 60 * pmin * this.chromatogram.SampleRate]
                }, false);
            } else {
                this.$data._graph.updateOptions({
                    dateWindow: [60 * pmin * this.chromatogram.SampleRate, 60 * pmax * this.chromatogram.SampleRate]
                }, false);

            }
        });

        /**
         * Disable the Context-Menu (right click) on the Canvas, so we can use it in our custom interaction
         * model for adding peaks
         */
        this._disableContextmenuOnRightclick();
    },
    updated() {
        console.log("updated!");
    },
    render: function (h) {
        return h(
            'div', {
                attrs: {
                    class: "dygraphsDiv"
                }
            }, [h('div', {
                attrs: {
                    id: 'dygraphs-graph-label' + this._uid,
                }
            }), h('div', {
                attrs: {
                    id: 'dygraphs-graph' + this._uid,
                    class: "dygraphsGraph"
                },
                style: "width:100%"
            })]
        );
    }
});

function transformDataToArray(c, graphName) {
    if (typeof c.tmp === 'undefined') {
        c.tmp = {};
    }
    if (c.tmp.dygraphsData === undefined) {
        c.tmp.dygraphsData = {};
    }

    var minNumberOfValues = getChannelSortOrderNamesForChannel(c,graphName) * c.SampleRate;

    if (c.Data.Data[graphName][0].length > minNumberOfValues) {
        if (c.tmp.dygraphsData[graphName] === undefined) {
            c.tmp.dygraphsData[graphName] = [];
            var i2 = 0;
            for (var i = 0; i < minNumberOfValues; i++) {
                c.tmp.dygraphsData[graphName][i] = [i, null];
                i2++;
            }
            for (var i = minNumberOfValues; i < c.Data.Data[graphName][0].length; i++) {
                c.tmp.dygraphsData[graphName][i2] = [i2, parseFloat(c.Data.Data[graphName][0][i]) * getChannelFactors(c)[graphName]];
                i2++;
            }
        } else {
            for (var i = c.tmp.dygraphsData[graphName].length; i < c.Data.Data[graphName][0].length; i++) {
                c.tmp.dygraphsData[graphName][i] = [i, parseFloat(c.Data.Data[graphName][0][i]) * getChannelFactors(c)[graphName]];
            }
        }
        return c.tmp.dygraphsData[graphName];
    } else {
        return [];
    }
}

function _getChannelOrderShifts(chromatogram) {
    var channelshifts = {};
    var splitted = chromatogram.ChannelOrderShift.split(',');
    for (var i = 0; i < splitted.length; i++) {
        var pair = splitted[i].split('-');
        channelshifts[pair[0].trim()] = parseInt(pair[1].trim());
    }
    return channelshifts;
}

function getChannelOrderShift(){
    return chromatogram.ChannelOrderShift.split(',')
        .map((x)=>{
            return {
                name:x.split(' - ')[0].trim(),
                value:parseInt(x.split(' - ')[1].trim())
            };
        });
}

function getChannelSortOrderNames(chromatogram){
    function hasChannelEnoughData(data,channelname,samplerate,mindata){
        return data[0].length > mindata*samplerate;
    }
    let channelnames = [];
    let cos = getChannelOrderShift();
    for(var i in chromatogram.Data.Data){
        for(var j=0;j<cos.length;j++){
            if(i.endsWith(cos[j].name) && hasChannelEnoughData(chromatogram.Data.Data[i],i,chromatogram.SampleRate,cos[j].value)){
                channelnames.push(
                    {
                        name:i,
                        value:cos[j].value
                    }
                );
            }
        }
    }
    channelnames.sort((a,b) => a.value > b.value ? 1: -1);
    return channelnames;
}

function getChannelSortOrderNamesForChannel(chromatogram,channelname){
    let tmp = getChannelSortOrderNames(chromatogram);
    for (var i=0;i<tmp.length;i++){
        if(tmp[i].name == channelname)
            return tmp[i].value;
    }
    return 0;
}

function getFactors(){
    let tmp = [];
    for (var i in chromatogram.Data.Factors){
        tmp.push(
            {
                name:i.trim(),
                value:parseFloat(chromatogram.Data.Factors[i])
            }
        );
    }
    return tmp;
}

function getChannelFactors(chromatogram){
    let channelnames = {};
    let fac = getFactors();
    for(var i in chromatogram.Data.Data){
        for(var j=0;j<fac.length;j++){
            if(i.endsWith(fac[j].name)){
                channelnames[i] = fac[j].value
            }
        }
    }
    return channelnames;
}

Vue.use("dygraphs-graph");
//chromatogram.Data.Data[self.graphname][0].length
