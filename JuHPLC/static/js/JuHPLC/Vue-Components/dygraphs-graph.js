Vue.component('dygraphs-graph', {
    props: {
        chromatogram: {},
        graphname: ""
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
                var tmp = g.toDomCoords(starttime, bl.calculateAtPointX(starttime)*this.chromatogram.Data.Factors[this.graphname]);
                ctx.moveTo(tmp[0], tmp[1]);
                var tmp = g.toDomCoords(starttime, g.rawData_[starttime][1]);
                ctx.lineTo(tmp[0], tmp[1]);

                for (var i = starttime + 1; i <= endtime; i++) {
                    var tmp = g.toDomCoords(i, g.rawData_[i][1]);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                var tmp = g.toDomCoords(endtime, bl.calculateAtPointX(endtime)*this.chromatogram.Data.Factors[this.graphname]);
                ctx.lineTo(tmp[0], tmp[1]);
                for (var i = endtime; i >= starttime; i--) {
                    var tmp = g.toDomCoords(i, bl.calculateAtPointX(i)*this.chromatogram.Data.Factors[this.graphname]);
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
                var tmp = g.toDomCoords(starttime, bl.calculateAtPointX(starttime)*factor);
                ctx.moveTo(tmp[0], tmp[1]);
                var tmp = g.toDomCoords(starttime, g.rawData_[starttime][1]);
                ctx.lineTo(tmp[0], tmp[1]);

                for (var i = starttime + 1; i <= endtime; i++) {
                    var tmp = g.toDomCoords(i, g.rawData_[i][1]);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                var tmp = g.toDomCoords(endtime, bl.calculateAtPointX(endtime)*factor);
                ctx.lineTo(tmp[0], tmp[1]);
                for (var i = endtime; i >= starttime; i--) {
                    var tmp = g.toDomCoords(i, bl.calculateAtPointX(i)*factor);
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
                    var tmp = g.toDomCoords(data[0][i], data[1][i]*this.chromatogram.Data.Factors[this.graphname]);
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
                tmp = g.toDomCoords(g.rawData_[i][0], bl.calculateAtPointX(g.rawData_[i][0])*this.chromatogram.Data.Factors[this.graphname]);
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
                var x = new SavitzkyGolayPeak(c.Data.Data[this.graphname], curr.StartTime, curr.EndTime).getPeakMaximumProjected().f_x;
                var shorttext = "";

                if (curr.Name === undefined || curr.Name.length === 0 || curr.Name === "undefined") {
                    shorttext = i;
                } else {
                    shorttext = curr.Name;
                }

                annotations.push({
                    series: this.graphname,
                    x: "" + x,
                    shortText: shorttext,
                    text: curr.Name,
                    tickHeight: 10,
                    width: shorttext.length * 9 + 10
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

            //setAnnotations has to be down here since it causes a refresh of the rendering
            //todo: set this elsewhere e.g. in updateOptions, documentations doesn't cover this case

            g.resize($($('.peakTable').children()[1]).width(),$('#dygraphs-graph' + this._uid).parent().height());

            $('#fii').innerHtml = $($('.peakTable').children()[1]).width();

            g.setAnnotations(annotations);
            g.updateOptions(graphOptions, false);


        },
        _disableContextmenuOnRightclick: function () {
            $('#dygraphs-graph' + this._uid ).contextmenu(function () {
                return false;
            });
        },
        zoomIntoPeak:function(peakid) {
            var p = this.chromatogram.Data.Peaks[this.graphname][peakid];
            var g = this.$data._graph;

            g.updateOptions({dateWindow: [p.StartTime - 20*this.chromatogram.SampleRate, p.EndTime + 20*this.chromatogram.SampleRate]}, false);
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
                        if (d < 100) {
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

                                console.log(context.dragStartX, context.dragEndX, event);
                                var start = Math.round(g.toDataXCoord(context.dragStartX));
                                var end = Math.round(g.toDataXCoord(context.dragEndX));

                                if (start > end) {
                                    var tmp = end;
                                    end = start;
                                    start = tmp;
                                }
                                g._drawPeakPreview(c, c.Data.Peaks[g.graphname].length, {
                                    "StartTime": start,
                                    "EndTime": end,
                                    "Mode": "default",
                                    "Name": "undefined"
                                }, g, g.canvas_ctx_, baseLine);
                            }

                        } else {
                            if (context.dragEndX !== null) {
                                context.dragEndX = null;
                                context.dragEndY = null;
                                g.clearZoomRect_();
                            }
                        }
                    } else if (context.isPanning) {
                        Dygraph.movePan(event, g, context);
                    }
                };
                var mouseup = function mouseup(event) {
                    if (context.isZooming) {
                        if (context.dragEndX !== null) {
                            if (event.button && event.button == 2 && !g.$rootData.editBaseline) {
                                console.log("MMB ZOOM END");
                                console.log(event);
                                console.log(context);

                                var start = Math.round(g.toDataXCoord(context.dragStartX));
                                var end = Math.round(g.toDataXCoord(context.dragEndX));

                                if (end < start) {
                                    end = Math.round(g.toDataXCoord(context.dragStartX));
                                    start = Math.round(g.toDataXCoord(context.dragEndX));
                                }
                                //addPeak(g.juHPLCName, g.toDataXCoord(context.dragStartX), g.toDataXCoord(context.dragEndX));

                                if (g.chromatogram.Data.Peaks == null) {
                                    Vue.set(g.chromatogram.Data, "Peaks", []);
                                    //g.chromatogram.Data.Peaks = [];
                                }
                                if (g.chromatogram.Data.Peaks[g.graphname] == null) {
                                    //g.chromatogram.Data.Peaks[g.graphname] = [];
                                    Vue.set(g.chromatogram.Data.Peaks, g.graphname, []);
                                }

                                console.log("adding peak from ",start," to ",end," to graph ",g.graphname);

                                g.chromatogram.Data.Peaks[g.graphname].push({
                                    "StartTime": start,
                                    "EndTime": end,
                                    "Mode": "default",
                                    "Name": "undefined"
                                });

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
                            Dygraph.endZoom(event, g, context);
                            document.removeEventListener('mousemove', mousemove, false);
                            document.removeEventListener('mouseup', mouseup, false);
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
                    Vue.set(wcd.Baseline,g.graphname,{
                        DatetimeValue: "",
                        Type: "linear"
                    });
                }
                var currentBaseline = wcd.Baseline[g.graphname];

                if (context.regionWidth < 10 || context.dragEndX == undefined) {//we don't want to handle zooming actions here
                    var x = g.toDataXCoord(context.dragStartX);
                    var y = g.toDataYCoord(context.dragStartY)/g.chromatogram.Data.Factors[g.graphname];

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
                        console.log("adding baseline point ",x,y);

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
                DygraphInteraction.startTouch(event, g, context);
            },
            touchmove: function touchmove(event, g, context) {
                DygraphInteraction.moveTouch(event, g, context);
            },
            touchend: function touchend(event, g, context) {
                DygraphInteraction.endTouch(event, g, context);
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
            }
        };

        //we want a higher pixel-ratio for better printing results
        var pixelratio = 1;
        if(location.search.substr(1) == "print=true")
            pixelratio = 4;

        this.$data._graph = new Dygraph('dygraphs-graph' + this._uid, transformDataToArray(this.chromatogram, this.graphname), {
            animatedZooms: false,
            labelsDiv: 'dygraphs-graph-label' + this._uid,
            legend: 'always',
            underlayCallback: this.juhplcdygraphsUnderlayCallback,
            drawCallback: this.juhplcdygraphsDrawCallback,
            interactionModel: this.interactionModel,
            ylabel: this.graphname+"( "+this.chromatogram.Data.Units[this.graphname]+" )",
            axes: {
                x: {
                    axisLabelFormatter: (x) => secondsMinutes(x, this.chromatogram.SampleRate),
                    valueFormatter: (x) => secondsMinutes(x, this.chromatogram.SampleRate)
                }
            },
            labels: ["x", this.graphname],
            pixelRatio:pixelratio
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
         * Autorefresh on new Data
         */
        this.$watch(() => chromatogram.Data.Data[this.graphname][0],
            () => {
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

        this.$eventHub.$on('zoomIntoPeak', (x) => {
                if (x.channelName === this.graphname) {
                    this.zoomIntoPeak(x.peakId);
                }
            }
        );

        this.$eventHub.$on('setColor', (x) => {
            if (x.channelName == this.graphname) {
                if(this.$data._graph.colors_[0] != x.color) {
                    console.log("setting new color ",x.color," on ",x.channelName);
                    this.$data._graph.updateOptions({color: x.color});
                }else{
                    console.log("already have color ",x.color," on ",x.channelName);
                }
            }
        });

        this.$eventHub.$on('setScaleY', (x) => {
            if (x.channelName == this.graphname) {
                console.log("<dygraphs-graph>setScaleY:",x);
                var pmin = parseFloat(x.min);
                var pmax = parseFloat(x.max);
                if(pmin > pmax){
                        this.$data._graph.updateOptions({
                        valueRange:[pmax,pmin]
                    },false);
                }else{
                    this.$data._graph.updateOptions({
                    valueRange:[pmin,pmax]
                },false);

            }
        }});

        this.$eventHub.$on('setScaleX', (x) => {

            console.log("<dygraphs-graph>setScaleX:",x);
            var pmin = parseFloat(x.min);
            var pmax = parseFloat(x.max);
            if(pmin > pmax){
                    this.$data._graph.updateOptions({
                    dateWindow:[60*pmax*this.chromatogram.SampleRate,60*pmin*this.chromatogram.SampleRate]
                },false);
            }else{
                this.$data._graph.updateOptions({
                dateWindow:[60*pmin*this.chromatogram.SampleRate,60*pmax*this.chromatogram.SampleRate]
            },false);

            }
        });

        /**
         * Disable the Context-Menu (right click) on the Canvas, so we can use it in our custom interaction
         * model for adding peaks
         */
        this._disableContextmenuOnRightclick();
    },
    updated(){
        console.log("updated!");
    },
    render: function (h) {
        return h(
            'div',{
                attrs:{
                    class:"dygraphsDiv"
                }}, [h('div', {
                attrs: {
                    id: 'dygraphs-graph-label' + this._uid,
                }
            }), h('div', {
                attrs: {
                    id: 'dygraphs-graph' + this._uid,
                    class:"dygraphsGraph"
                },
                style: "width:100%"
            })]
        );
    }
});

function transformDataToArray(c, graphName) {
    var channelshifts = _getChannelOrderShifts(c);

    if(!channelshifts.hasOwnProperty(graphName))
        return [];

    if (typeof c.tmp === 'undefined') {
        c.tmp = {};
    }
    if (c.tmp.dygraphsData === undefined) {
        c.tmp.dygraphsData = {};
    }
    var minNumberOfValues = channelshifts[graphName] * c.SampleRate;
    if (c.Data.Data[graphName][0].length > minNumberOfValues) {
        if (c.tmp.dygraphsData[graphName] === undefined) {
            c.tmp.dygraphsData[graphName] = [];
            var i2 = 0;
            for (var i = 0; i < minNumberOfValues; i++) {
                c.tmp.dygraphsData[graphName][i] = [i, null];
                i2++;
            }
            for (var i = minNumberOfValues; i < c.Data.Data[graphName][0].length; i++) {
                c.tmp.dygraphsData[graphName][i2] = [i2, parseFloat(c.Data.Data[graphName][0][i])*parseFloat(c.Data.Factors[graphName])];
                i2++;
            }
        } else {
            for (var i = c.tmp.dygraphsData[graphName].length; i < c.Data.Data[graphName][0].length; i++) {
                c.tmp.dygraphsData[graphName][i] = [i, parseFloat(c.Data.Data[graphName][0][i])*parseFloat(c.Data.Factors[graphName]) ];
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

Vue.use("dygraphs-graph");
//chromatogram.Data.Data[self.graphname][0].length