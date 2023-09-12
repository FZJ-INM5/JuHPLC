Vue.component('peak-table', {
    props: {
        peaks: {},
        graphname: "",
        chromatogram: {}
    },
    template: '<div class="peakTable"><table class="table table-sm juhplcPeakTable page-break-inside-avoid" v-show="peaks[graphname] && peaks[graphname].length">\n' +
    '            <thead>\n' +
    '            <tr>\n' +
    '                <th></th>\n' +
    '                <th>#</th>\n' +
    '                <th>Name</th>\n' +
    '                <th>t<sub>R</sub></th>\n' +
    '                <th>k\'</th>\n' +
    '                <th>Symmetry</th>\n' +
    '                <th>N</th>\n' +
    '                <th>Area</th>\n' +
    '                <th class="hidden-print">Details</th>\n' +
    '                <th class="hidden-print">Delete</th>\n' +
    '                <th>%</th>\n' +
    '            </tr>\n' +
    '            </thead>\n' +
    '            <tbody>\n' +
    '                <peak-table-row ' +
    '                     v-for="(data,key) in peaks[graphname]" ' +
    '                     :peak="data" ' +
    '                       :graphname="graphname" ' +
    '                       :idx="key" ' +
    '                       :chromatogram="chromatogram" ' +
    '                       :key="data.StartTime+\'-\'+data.EndTime">' +
    '                </peak-table-row>' +
    '            </tbody>\n' +
    '        </table></div>',
    methods: {
        CheckedPeaksArea: function () {
            let sum = 0;
            for (let i = 0; i < this.$children.length; i++) {
                let currentChild = this.$children[i];
                if (currentChild.$data._checked) {
                    sum += currentChild.PeakArea;
                }
            }
            return sum;
        },
        remove_peak: function (peakToRemoveIdx) {
            console.log("this.peaks");
            console.log(this.peaks);
            var msg = JSON.stringify({
                    type: 'removePeak',
                    channel: this.graphname,
                    data:this.peaks[this.graphname][peakToRemoveIdx]
            });
	    if(window.chatSocket.readyState == WebSocket.OPEN) {
                window.chatSocket.send(msg);
            } else {
                window.chatSocket.onMessage(msg);
	    }
            this.peaks[this.graphname].splice(peakToRemoveIdx, 1);
        }
    },
    created() {
        console.log("peak-table");
        console.log(this);

        this.$on("remove_peak", (peakIdx) => {
            this.remove_peak(peakIdx);
        });
    }
});
Vue.use("peak-table");

Vue.component('peak-table-row', {
    props: ["peak", "graphname", "idx", "chromatogram"],
    data() {
        return {
            _peak: {},
            _checked: false
        };
    },
    created() {
        this.$data._peak = this.getSavitzkyGolayPeak(this.graphname, this.idx);
        this.$data._checked = false;
    },
    watch:{
        "peak.Name":function(val){
            $('#peak-table-row-nameInput' + this._uid).val(val);
        }
    },
    computed: {
        PeakArea: function () {
            return Math.round(this.$data._peak.calculatePeakArea(this.idx) * 100) / 100;
        },
        PeakAreaDecayCorrected: function () {
            return Math.round(this.$data._peak.calculatePeakAreaDecayCorrected(this.chromatogram.HalfLife) * 100) / 100;
        },
        RetentionTime: function () {
            return Math.round(this.$data._peak.getPeakMaximumProjected().f_x / 60 * this.chromatogram.SampleRate * 100) / 100;
        },
        PeakAreaPercent: function () {
            if (this.$data._checked) {
                return Math.round((this.PeakArea / this.$parent.CheckedPeaksArea()) * 10000) / 100;
            } else {
                return "/";
            }
        },
        RetentionFactor: function () {
            return Math.round(this.$data._peak.calculate_retention_factor(this.chromatogram.DeadTime) * 100) / 100;
        },
        PeakSymmetry: function () {
            var sym = this.$data._peak.getPeakSymmetry(50);
            return Math.round(sym.a / sym.b * 100) / 100;
        },
        EfficiencyFactor: function () {
            return Math.round(this.$data._peak.getEfficiencyFactor(50) * 100) / 100;
        }
    },
    methods: {
        toggleChecked: function (event) {
            this.$data._checked = !this.$data._checked;
        },
        removePeak: function () {
            if (this.$data._checked) {
                this.toggleChecked();
            }
            this.$nextTick(function () {
                this.$parent.$emit('remove_peak', this.idx);
            });

        },
        zoomInto: function () {
            this.$eventHub.$emit('zoomIntoPeak', {
                channelName: this.graphname,
                peakId: this.idx
            });
        },
        getSavitzkyGolayPeak: function () {
            let currentpeak = this.chromatogram.Data.Peaks[this.graphname][this.idx];
            return new SavitzkyGolayPeak(this.chromatogram.Data.Data[this.graphname], currentpeak.StartTime, currentpeak.EndTime, this.graphname, this.chromatogram);
        },
        peakNameChanged: function (event) {
            this.peak.Name = event.target.value;

            var msg = JSON.stringify({
                    'type':'renamePeak',
                    'channel':this.graphname,
                    'data':this.peak
            });
	    if(window.chatSocket.readyState == WebSocket.OPEN) {
                window.chatSocket.send(msg);
	    } else {
                window.chatSocket.onMessage(msg);
	    }
        },
        PeakAreaRender() {
            var area = this.PeakArea;
            var result = area;

            if (this.graphname === "Counter" &&
                typeof(this.chromatogram.HalfLife) !== 'undefined' &&
                this.chromatogram.HalfLife > 0) {
                result += "(" + this.PeakAreaDecayCorrected + ")";
            }

            if (typeof(this.chromatogram.calibration) !== 'undefined') {
                for (var i = 0; i < this.chromatogram.calibration.length; i++) {
                    var cur = this.chromatogram.calibration[i].fields;
                    if (this.peak.Name == cur.Name && cur.Channel == this.graphname) {
                        result += " (" + Math.round((cur.Slope * area + cur.YAxisIntercept) * 100) / 100 + " " + cur.Unit + " )";
                    }
                }
            }

            return result;
        }

    },
    render(h) {
        if(typeof(this.peak.active) !== 'undefined' && this.peak.active){
            return h('tr');
        }else {
            return h('tr', {
                    style: {
                        backgroundColor: getColor(this.idx, 0.5)
                    }
                }, [
                    h("td", [h("input", {
                            attrs: {
                                type: "checkbox",
                                checked: this.$data._checked
                            },
                            on: {
                                change: this.toggleChecked
                            }
                        }
                    )]),
                    h("td", this.idx),
                    h("td", [h('input', {
                        attrs: {
                            type: 'text',
                            value: this.peak.Name,
                            id: 'peak-table-row-nameInput' + this._uid,
                            class: "peak-table-textbox"
                        },
                        on: {
                            input: this.peakNameChanged
                        }
                    })]),
                    h("td", this.RetentionTime),
                    h("td", this.RetentionFactor),
                    h("td", this.PeakSymmetry),
                    h("td", this.EfficiencyFactor),
                    h("td", this.PeakAreaRender()),
                    h("td", {attrs: {class: "hidden-print"}}, [h("button", {
                        attrs: {
                            type: "button",
                            class: "btn btn-info btn-sm",
                            style: "padding:0rem 1rem;"
                        },
                        on: {
                            click: this.zoomInto
                        }
                    }, "Details")]),
                    h("td", {attrs: {class: "hidden-print"}}, [h("button", {
                        attrs: {
                            type: "button",
                            class: "btn btn-danger btn-sm hidden-print",
                            style: "padding:0rem 1rem;"
                        },
                        on: {
                            click: this.removePeak
                        }
                    }, "Delete")]),
                    h("td", this.PeakAreaPercent)
                ]
            );
        }
    }
});
Vue.use("peak-table-row");
