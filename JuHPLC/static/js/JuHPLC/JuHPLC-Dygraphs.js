/**
 * Created by v.mauel on 16.05.2017.
 */

juhplcDygraphsTemplate = `
<div class="col col-lg-6 col-md-12 col-sm-12 col-xs-12">
    <div class="col col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <div id="####GRAPHNAME####Label"></div>
        <div id="####GRAPHNAME####Graph" class="juhplc-graph"></div>
    </div>
    <div class="col col-lg-12 col-md-12 col-sm-12 col-xs-12 peakTable">
        <table class="table small juhplcPeakTable" id="####GRAPHNAME####PeakTable">
            <thead>
            <tr>
                <th></th>
                <th>#</th>
                <th>Name</th>
                <th>t<sub>R</sub></th>
                <th class='rtk'>k'</th>
                <th>Area</th>
                <th>Details</th>
                <th>Delete</th>
                <th>%</th>
            </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
</div>
`;

String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

class JuHPLCDygraphs {
    constructor(juhplc, targetDiv) {
        this.juhplc = juhplc;
        juhplc.juhplcdygraphs = this;
        this.graphs = {};
        this.graphsarr = []
        this.sync = null;

        this.peakspercentages = {};
        $(targetDiv).empty();
        let html = "";
        let count = 0;

        //using .keys.sort() to make sure the channels are always ordered by Name, so the order stays the same between
        //multiple runs
        Object.keys(juhplc.chromatogram.Data.Data).sort().forEach(function (key) {
            console.log(juhplcDygraphsTemplate.replaceAll("####GRAPHNAME####", key));
            html += juhplcDygraphsTemplate.replaceAll("####GRAPHNAME####", key);
            count++;
        });
        $(targetDiv).html(html);

        if (count === 1) {

            for (let key in juhplc.chromatogram.Data.Data) {
                if (juhplc.chromatogram.Data.Data.hasOwnProperty(key)) {
                    $('#' + key + "Graph").parent().parent().removeClass("col-lg-6").addClass("col-lg-12");
                }
            }
        }

        var channelshifts = {};
        var tmp = this.juhplc.chromatogram.ChannelOrderShift.split(',');
        for(var i=0;i<tmp.length;i++){
            var tmp2 = tmp[i].split('-');
            channelshifts[tmp2[0].trim()]=tmp2[1].trim();
        }

        for (let key in juhplc.chromatogram.Data.Data) {
            if (juhplc.chromatogram.Data.Data.hasOwnProperty(key)) {
                var label = "";
                if (Object.keys(this.juhplc.chromatogram.Data.Units).includes(key)) {
                    label = "<a href='javascript:window.juhplc.scaleGraphY(\"" + key + "\");'>" + this.juhplc.chromatogram.Data.Units[key] + "</a>";
                } else {
                    label = "<a href='javascript:window.juhplc.scaleGraphY(\"" + key + "\");'>unnamed</a>";
                }
                this.graphs[key] = new Dygraph(
                    document.getElementById(key + "Graph"),
                    this.transformDataToArray(key),
                    {
                        animatedZooms: false,
                        labelsDiv: key + "Label",
                        legend: 'always',
                        underlayCallback: juhplcdygraphsUnderlayCallback,
                        drawCallback: juhplcdygraphsDrawCallback,
                        interactionModel: juhplcDygraphsInteractionModel,
                        ylabel: label,
                        axes: {
                            x: {
                                axisLabelFormatter: secondsMinutes,
                                valueFormatter: secondsMinutes
                            }
                        },
                        labels: ["x", key]
                    }
                );

                this.graphs[key].juHPLCName = key;
                this.graphs[key].channelShift = channelshifts[key];

                $('#' + key + 'Graph > div > canvas').contextmenu(function () {
                    return false;
                });
                this.peakspercentages[key] = [];
                this.graphsarr.push(this.graphs[key]);
            }
        }


    }

    refreshGraphs(options) {
        var opt = (typeof options === 'undefined') ? {"keepXAxis":false,"keepYAxis":false}:options;


        for (var graphname in this.graphs) {
            var annotations = this._getAnnotationsForGraphname(graphname);

            var graphOptions = {};

            if (opt.keepXAxis)
                graphOptions.dateWindow = this.graphs[graphname].dateWindow_;
            if (opt.keepYAxis && this.graphs[graphname].isZoomed()) {
                graphOptions.valueRange = this.graphs[graphname].yAxisRange();
                if(this.graphs[graphname].dateWindow_ != null
                    && (this.graphs[graphname].dateWindow_[0] != this.graphs[graphname].xAxisRange()[0]
                        && this.graphs[graphname].dateWindow_[1] != this.graphs[graphname].xAxisRange()[1])) {
                    graphOptions.dateWindow = [1,this.juhplc.chromatogram.Data.dygraphsData[graphname].length-1];
                }else{
                    graphOptions.dateWindow = this.graphs[graphname].dateWindow_;
                }
            }else{
                graphOptions.valueRange = null;
            }
            graphOptions.file=this.transformDataToArray(graphname);

            //setAnnotations has to be down here since it causes a refresh of the rendering
            //todo: set this elsewhere e.g. in updateOptions, documentations doesn't cover this case

            this.graphs[graphname].setAnnotations(annotations);
            this.graphs[graphname].updateOptions(graphOptions, false);


        }
    }

    _getAnnotationsForGraphname(graphname) {
        var annotations = [];
        for (var i in this.juhplc.chromatogram.Data.Peaks[graphname]) {
            var curr = this.juhplc.chromatogram.Data.Peaks[graphname][i];
            var x = new SavitzkyGolayPeak(this.juhplc.chromatogram.Data.Data[graphname], this.juhplc.chromatogram.DeadTime, curr.StartTime, curr.EndTime).getPeakMaximumProjected().f_x;
            var shorttext = "";
            if (curr.Name === undefined || curr.Name.length == 0 || curr.Name == "undefined")
                shorttext = i;
            else
                shorttext = curr.Name;
            annotations.push({
                series: graphname,
                x: "" + x,
                shortText: shorttext,
                text: curr.Name,
                tickHeight: 10,
                width: shorttext.length * 9 + 10
            });
        }
        return annotations;
    }

    resizeGraphs(){
        for(var i in this.graphs){
            this.graphs[i].resize();
        }
    }

    refreshPeakTables() {
        for (var key in this.juhplc.chromatogram.Data.Data) {
            this.addPeaksToTable(key);
        }
        if(this.juhplc.chromatogram.DeadTime == 0) {
            $('.rtk').html("t<sub>R</sub>");
        }else{
            $('.rtk').text("k'");
        }
    }

    addPeaksToTable(name) {
        var targetTable = "#" + name + "PeakTable";

        $(targetTable + " > tbody").remove();
        $(targetTable).append("<tbody></tbody>");

        //when there are no peaks for the graph, we want to hide the table and return
        if (!this.juhplc.chromatogram.Data.Peaks.hasOwnProperty(name) || this.juhplc.chromatogram.Data.Peaks[name].length == 0) {
            $(targetTable).hide();
            return;
        }

        //else show the table and insert the peaks into it
        $(targetTable).show();


        var peakSum = 0;
        for (var i = 0; i < this.peakspercentages[name].length; i++) {
            peakSum += Math.round(this.juhplc.getSavitzkyGolayPeak(name, this.peakspercentages[name][i]).calculatePeakArea(i) * 100) / 100;
        }


        for (var i = 0; i < this.juhplc.chromatogram.Data.Peaks[name].length; i++) {

            var peak = this.juhplc.getSavitzkyGolayPeak(name, i);
            var funct = "window.juhplc.juhplcdygraphs.zoomIntoPeak('" + name + "'," + i + ",true);";
            var functDel = "window.juhplc.deletePeak('" + name + "'," + i + ");";
            var functRename = "window.juhplc.renamePeak('" + name + "'," + i + ");";
            var html = "<tr style=\"background-color:" + getColor(i, 0.5) + ";\">";

            var currentPeakArea = Math.round(peak.calculatePeakArea(i) * 100) / 100;

            var checked = this.peakspercentages[name].indexOf(i) >= 0 ? "checked" : "";

            html += "<td><input type='checkbox' " +
                "onclick='peakCheckboxChanged(this,\"" + name + "\"," + i + ");' " +
                "id='PeakCheckbox-" + name + "-" + i + "' " + checked + "/></td>";
            html += "<td>" + i + "</td>";
            if(typeof(this.juhplc.chromatogram.Data.Peaks[name][i].Name) == undefined || this.juhplc.chromatogram.Data.Peaks[name][i].Name == null || this.juhplc.chromatogram.Data.Peaks[name][i].Name == "" ){
                html += "<td><a href=\"javascript:" + functRename + "\">undefined</a></td>";
            }else{
                html += "<td><a href=\"javascript:" + functRename + "\">"+this.juhplc.chromatogram.Data.Peaks[name][i].Name+"</a></td>";
            }


            html += "<td>" + Math.round(peak.getPeakMaximumProjected().f_x/60*this.juhplc.chromatogram.SampleRate*100)/100 + "</td>";
            html += "<td>" + Math.round(peak.calculate_retention_factor() * 100) / 100 + "</td>";
            html += "<td>" + currentPeakArea + "</td>";
            html += "<td><a href=\"javascript:" + funct + "\">Show</a></td>";
            html += "<td><a href=\"javascript:" + functDel + "\">Delete</a></td>";

            if (this.peakspercentages[name].length > 0) {
                if (this.peakspercentages[name].indexOf(i) >= 0) {
                    html += "<td>" + Math.round((currentPeakArea / peakSum) * 10000) / 100 + "</td>"
                } else {
                    html += "<td> / </td>";
                }
            } else {
                html += "<td></td>";
            }

            html += "</tr>";
            $(targetTable + ' > tbody:last-child').append(html);


        }
    }

    transformDataToArray(graphName) {
        var channelshifts = this._getChannelOrderShifts();

        if (this.juhplc.chromatogram.Data.dygraphsData === undefined) {
            this.juhplc.chromatogram.Data.dygraphsData = {};
        }
        var minNumberOfValues = channelshifts[graphName]*this.juhplc.chromatogram.SampleRate;
        if(this.juhplc.chromatogram.Data.Data[graphName][0].length > minNumberOfValues) {
            if (this.juhplc.chromatogram.Data.dygraphsData[graphName] === undefined) {
                this.juhplc.chromatogram.Data.dygraphsData[graphName] = [];
                var i2 = 0;
                for (var i = 0; i < minNumberOfValues; i++) {
                    this.juhplc.chromatogram.Data.dygraphsData[graphName][i] = [i, null];
                    i2++;
                }
                for (var i = minNumberOfValues; i < this.juhplc.chromatogram.Data.Data[graphName][0].length; i++) {
                    this.juhplc.chromatogram.Data.dygraphsData[graphName][i2] = [i2, this.juhplc.chromatogram.Data.Data[graphName][0][i]];
                    i2++;
                }
            } else {
                for (var i = this.juhplc.chromatogram.Data.dygraphsData[graphName].length; i < this.juhplc.chromatogram.Data.Data[graphName][0].length; i++) {
                    this.juhplc.chromatogram.Data.dygraphsData[graphName][i] = [i, this.juhplc.chromatogram.Data.Data[graphName][0][i]];
                }
            }
            return this.juhplc.chromatogram.Data.dygraphsData[graphName];
        }else{
            return [];
        }
    }

    _getChannelOrderShifts() {
        var channelshifts = {};
        var splitted = this.juhplc.chromatogram.ChannelOrderShift.split(',');
        for (var i = 0; i < splitted.length; i++) {
            var pair = splitted[i].split('-');
            channelshifts[pair[0].trim()] = parseInt(pair[1].trim());
        }
        return channelshifts;
    }

    peakPercentage(shouldInclude, graphName, peakIdx) {
        if (shouldInclude && this.peakspercentages[graphName].indexOf(peakIdx) < 0) {
            this.peakspercentages[graphName].push(peakIdx);
        }
        if (!shouldInclude && this.peakspercentages[graphName].indexOf(peakIdx) >= 0) {
            this.peakspercentages[graphName] = this.peakspercentages[graphName].filter(function (a, b) {
                return a != peakIdx;
            });
        }
        this.refreshPeakTables();
    }

    clearPeakPercentage(name) {
        this.peakspercentages[name] = [];
    }

    setXScale(min,max){
        for( var i in this.graphs){
            this.graphs[i].updateOptions({
                dateWindow:[60*min,60*max]
            },false);
        }
    }

    setYScale(graphname,min,max){
        var pmin = parseFloat(min);
        var pmax = parseFloat(max);
        if(pmin > pmax){
                this.graphs[graphname].updateOptions({
                valueRange:[pmax,pmin]
            },false);
        }else{
            this.graphs[graphname].updateOptions({
            valueRange:[pmin,pmax]
        },false);
        }

    }

    getDygraphs() {
        var tmp = [];
        for (var i in this.graphs) {
            tmp.push(this.graphs[i]);
        }
        return tmp;
    }

    zoomIntoPeak(graphname, peakid, zoomAllGraphs) {
        var p = this.juhplc.chromatogram.Data.Peaks[graphname][peakid];
        var g = this.graphs[graphname];

        if (zoomAllGraphs === undefined)
            zoomAllGraphs = false;

        if (zoomAllGraphs) {
            for (var i in this.graphs) {
                this.graphs[i].updateOptions({dateWindow: [p.StartTime - 20, p.EndTime + 20]}, false);
            }
        } else {
            g.updateOptions({dateWindow: [p.StartTime - 20, p.EndTime + 20]}, false);
        }
    }
}



function peakCheckboxChanged(checkbox, graphname, peakidx) {
    window.juhplc.juhplcdygraphs.peakPercentage(checkbox.checked, graphname, peakidx);

}

