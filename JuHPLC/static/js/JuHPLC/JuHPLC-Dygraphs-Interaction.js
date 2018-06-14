juhplcdygraphsUnderlayCallback = function (canvas, area, g) {
    if (this.juHPLCName === undefined) {
        //we don't know our own name as of yet, so return and force a re-rendering afterwards
        setTimeout(function () {
            g.updateOptions({}, false);
        }, 500);
        return;
    }

    //draw window.chromatogram.DeadTime here if is set
    if (window.juhplc.chromatogram.DeadTime != -1) {
        var bottom_left = g.toDomCoords(window.juhplc.chromatogram.DeadTime, -200000);
        var top_right = g.toDomCoords(window.juhplc.chromatogram.DeadTime + 0.1, +200000);
        top_right[0] = bottom_left[0] + 1;
        var left = bottom_left[0];
        var right = top_right[0];
        canvas.fillStyle = "rgba(255, 0, 0, 0.5)";
        canvas.fillRect(left, area.y, right - left, area.h);
    }
    //end draw window.chromatogram.DeadTime

    var bl = {};
    if(window.juhplc.chromatogram.Data.Baseline !== undefined
                && window.juhplc.chromatogram.Data.Baseline[this.juHPLCName] !== undefined) {
        bl = new Baseline(window.juhplc.chromatogram.Data.Baseline[this.juHPLCName]);
    }

    if (window.juhplc.chromatogram.Data.Peaks != null
        && window.juhplc.chromatogram.Data.Peaks[this.juHPLCName] != null
        && window.juhplc.chromatogram.Data.Peaks[this.juHPLCName].length > 0) {
        for (var peakIdx = 0; peakIdx < window.juhplc.chromatogram.Data.Peaks[this.juHPLCName].length; peakIdx++) {
            var currentPeak = window.juhplc.chromatogram.Data.Peaks[this.juHPLCName][peakIdx];

            // only handle this for peaks that are within view
            if (this.dateWindow_ != null) {
                if (this.dateWindow_[1] < currentPeak.StartTime || this.dateWindow_[0] > currentPeak.EndTime) {
                    continue;
                }
            }

            var starttime = currentPeak.StartTime;
            var endtime = currentPeak.EndTime;
            var farbe = getColor(peakIdx, 0.5);



            var ctx = canvas;

            ctx.fillStyle = farbe;
            ctx.beginPath();


            if(window.juhplc.chromatogram.Data.Baseline === undefined
                || window.juhplc.chromatogram.Data.Baseline[this.juHPLCName] === undefined){

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
            }else{
                var tmp = this.toDomCoords(starttime, bl.calculateAtPointX(starttime));
                ctx.moveTo(tmp[0],tmp[1]);
                var tmp = this.toDomCoords(starttime, g.rawData_[starttime][1]);
                ctx.lineTo(tmp[0],tmp[1]);

                for(var i=starttime+1;i<=endtime;i++){
                    var tmp = this.toDomCoords(i, this.rawData_[i][1]);
                    ctx.lineTo(tmp[0], tmp[1]);
                }
                var tmp = g.toDomCoords(endtime,bl.calculateAtPointX(endtime));
                ctx.lineTo(tmp[0],tmp[1]);
                for(var i=endtime;i>=starttime;i--){
                    var tmp = g.toDomCoords(i,bl.calculateAtPointX(i));
                    ctx.lineTo(tmp[0],tmp[1]);
                }
                ctx.closePath();
                ctx.fill();
            }
        }

    }



};

juhplcdygraphsDrawCallback = function (graph, is_initial) {


    //console.log("Draw Call");
    var chrom = window.juhplc.chromatogram;
    var bl = chrom.Data.Baseline;

    //we have no data for the baseline yet, so we can't draw anything of it yet.
    //todo: maybe add a fallback for linear baseline from 0|f(0) to x_max|f(x_max)
    if (bl[graph.juHPLCName] === undefined)
        return;

    var bl = new Baseline(bl[graph.juHPLCName]);

    var ctx = graph.hidden_ctx_; //using hidden-context instead of

    if(window.juhplc.editBaseline) {

        var data = bl.getValues();
        for (var i = 0; i < data[0].length; i++) {
            //console.log(i);

            ctx.beginPath();
            var tmp = graph.toDomCoords(data[0][i], data[1][i]);
            ctx.arc(tmp[0], tmp[1], 3, 0, 2 * Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
        }
    }


    ctx.beginPath();
    if(!window.juhplc.editBaseline) {
        ctx.fillStyle = "green";
        ctx.lineWidth = 0.2;
    }
    var tmp = graph.toDomCoords(0, 0);
    ctx.moveTo(tmp[0], tmp[1]);

    for (var i = 0; i < this.rawData_.length-1; i++) {
        tmp = graph.toDomCoords(this.rawData_[i][0],bl.calculateAtPointX( this.rawData_[i][0]));
        ctx.lineTo(tmp[0], tmp[1]);
    }

    ctx.stroke();

    //console.log("End Draw Call");


};




juhplcDygraphsInteractionModel = {
    // Track the beginning of drag events
    mousedown: function mousedown(event, g, context) {
        // Right-click should not initiate a zoom.
        if (event.button && event.button == 2 && window.juhplc.editBaseline) {
            juhplcDygraphsInteractionModel.click(event,g,context);
        }

        context.initializeMouseDown(event, g, context);

        if (window.juhplc.selectDeadTime) {
            SetDeadTime.call(g, g.toDataXCoord(context.dragStartX));

            //cleanup
            context.dragEndX = context.dragEndY = null;
            context.destroy();
            //endcleanup
            window.juhplc.juhplcdygraphs.refreshPeakTables();
            window.juhplc.juhplcdygraphs.refreshGraphs();

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
                if (d < 100) {
                    Dygraph.moveZoom(event, g, context);
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
                    if (event.button && event.button == 2 && !window.juhplc.editBaseline) {
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

                        if (window.juhplc.chromatogram.Data.Peaks != null) {
                            if (window.juhplc.chromatogram.Data.Peaks[g.juHPLCName] == null) {
                                window.juhplc.chromatogram.Data.Peaks[g.juHPLCName] = [];
                            }

                            window.juhplc.addPeak(g.juHPLCName, {
                                "StartTime": start,
                                "EndTime": end,
                                "Mode": "default",
                                "Name":"undefined"
                            },false);


                        }

                        context.dragEndX = null;
                        context.dragEndY = null;
                        g.clearZoomRect_();

                        context.destroy();

                        window.juhplc.juhplcdygraphs.refreshPeakTables();
                        window.juhplc.juhplcdygraphs.refreshGraphs({keepXAxis:true,keepYAxis:true});

                        return;
                    }
                    if (window.juhplc.editBaseline) {
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
        if (!window.juhplc.editBaseline)
            return;
        var wcd = window.juhplc.chromatogram.Data;

        if(!wcd.Baseline.hasOwnProperty(g.juHPLCName)){
            wcd.Baseline[g.juHPLCName] = {
                        DatetimeValue:"",
                        Type:"linear"
                    };
        }
        var currentBaseline = wcd.Baseline[g.juHPLCName];

        if (context.regionWidth < 10 || context.dragEndX == undefined) {//we don't want to handle zooming actions here
            var x = g.toDataXCoord(context.dragStartX);
            var y = g.toDataYCoord(context.dragStartY);

            if(isNaN(x) || isNaN(y))
                return;

            console.log(event);
            if (context.regionWidth == 0) { //check if exact pair is already in the list. if so, we just added it during a dblclick event, so we remove it instead
                //currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue,x, y);
            }

            if (event.button === 2) { //right click, so remove closest point
                console.log("removing point near x:"+x+" y:"+y);
                currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue,g,context.dragStartX,context.dragStartY);
                if(currentBaseline.DatetimeValue.length === 0){
                    //we have no more points, so remove baseline
                    delete wcd.Baseline[g.juHPLCName];
                }
                window.juhplc.juhplcdygraphs.refreshPeakTables();
                window.juhplc.juhplcdygraphs.refreshGraphs({keepXAxis:true,keepYAxis:true})
            }
            if(event.button == 0){
                console.log("adding baseline point");

                if(currentBaseline.DatetimeValue.length == 0){
                    currentBaseline.DatetimeValue += ""+x + "," + y
                }else {
                    currentBaseline.DatetimeValue += ","+x + "," + y
                }
                 currentBaseline.DatetimeValue = sortBaselineString( currentBaseline.DatetimeValue);
                window.juhplc.juhplcdygraphs.refreshPeakTables();
                window.juhplc.juhplcdygraphs.refreshGraphs({keepXAxis:true,keepYAxis:true})
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

        if(window.juhplc.editBaseline){
            var wcd = window.juhplc.chromatogram.Data;
            var currentBaseline = wcd.Baseline[g.juHPLCName];
            currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue,g,context.dragStartX,context.dragStartY);
            currentBaseline.DatetimeValue = removeClosestPointFromBaselineString(currentBaseline.DatetimeValue,g,context.dragStartX,context.dragStartY);
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