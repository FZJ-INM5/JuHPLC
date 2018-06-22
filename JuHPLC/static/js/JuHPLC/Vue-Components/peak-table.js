Vue.component('peak-table', {
    props: {
        peaks: {},
        graphname: "",
        chromatogram: {}
    },
    template: '<div class="peakTable"><table class="table table-sm juhplcPeakTable page-break-inside-avoid" >\n' +
    '            <thead>\n' +
    '            <tr>\n' +
    '                <th></th>\n' +
    '                <th>#</th>\n' +
    '                <th>Name</th>\n' +
    '                <th>t<sub>R</sub></th>\n' +
    '                <th>k\'</th>\n' +
    '                <th>Area</th>\n' +
    '                <th>Details</th>\n' +
    '                <th>Delete</th>\n' +
    '                <th>%</th>\n' +
    '            </tr>\n' +
    '            </thead>\n' +
    '            <tbody>\n' +
    '                <peak-table-row ' +
    '                     v-for="(data,key) in peaks[graphname]" ' +
    '                     :peak="data" :graphname="graphname" :idx="key" :chromatogram="chromatogram" :key="data.StartTime+\'-\'+data.EndTime">' +
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
        console.log("peak-table-row");
        console.log(this);
        this.$data._peak = this.getSavitzkyGolayPeak(this.graphname, this.idx);
        this.$data._checked = false;
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
            this.$eventHub.$emit('zoomIntoPeak', {channelName:this.graphname,peakId:this.idx});
        },
        getSavitzkyGolayPeak: function () {
            let currentpeak = this.chromatogram.Data.Peaks[this.graphname][this.idx];
            return new SavitzkyGolayPeak(this.chromatogram.Data.Data[this.graphname], currentpeak.StartTime, currentpeak.EndTime, this.graphname, this.chromatogram);
        },
        peakNameChanged:function(event){
            this.peak.Name=event.target.value;
        },
        PeakAreaRender(){
            if(this.graphname === "Counter" && typeof(this.chromatogram.HalfLife) != undefined && this.chromatogram.HalfLife > 0){
                return this.PeakArea+"("+this.PeakAreaDecayCorrected+")";
            }else{
                return this.PeakArea;
            }
        }
    },
    render(h) {
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
                        value: this.peak.Name
                    },
                    on: {
                        input: this.peakNameChanged
                    }
                })]),
                h("td", this.RetentionTime),
                h("td", this.RetentionFactor),
                h("td", this.PeakAreaRender()),
                h("td", [h("button", {
                    attrs: {
                        type: "button",
                        class: "btn btn-info btn-sm",
                        style: "padding:0rem 1rem;"
                    },
                    on: {
                        click: this.zoomInto
                    }
                }, "Details")]),
                h("td", [h("button", {
                    attrs: {
                        type: "button",
                        class: "btn btn-danger btn-sm",
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
});
Vue.use("peak-table-row");