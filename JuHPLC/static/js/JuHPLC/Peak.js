/**
 * Created by v.mauel on 05.04.2017.
 */
class Peak {


    /**
     * Creates a new Peak-Object that can be analyzed with the class-methods
     * @param data the array containing all values required to further anaylze the peak
     * @param startTime the starting time of the peak, as 0-based index to access the data array
     * @param endTime the ending time of the peak, as zero-based index to access the data array
     * @constructor
     */
    constructor(data, startTime, endTime, chromatogram) {
        this.data = data;
        this.startTime = startTime;
        this.StartTime=startTime;
        this.endTime = endTime;
        this.EndTime=this.endTime;

        // here we project the peak to have a base-line parallel to the x-axis, so we can more easily identify the
        // other parameters such as symmetry, area, height and more

        //in this step, it can happen, that the maximum value will shift away from the measured maximum value.

        this.projectedData = [];

        var tmp = this.calculateLinearInterpolation(0);

        for (var i = 0; i <= data.length; i++) {
            if (i < startTime || i >= endTime) {
                this.projectedData[i] = data[i];
            } else {
                this.projectedData[i] = data[i] - tmp(i) + ((data[endTime] + data[startTime]) / 2);
            }
        }
    }

    /**
     * Calculates the Linear Interpolation on the nth derivative for this peak
     * @param deriv
     * @returns {Function}
     */
    calculateLinearInterpolation(deriv) {
        deriv = (typeof deriv !== 'undefined') ? deriv : 0;
        var d = [];
        if (deriv == 0) {
            d = this.data;
        } else {
            d = this.filteredData[deriv];
        }

        var y1 = d[this.startTime];
        var y2 = d[this.endTime];
        var x1 = this.startTime;
        var x2 = this.endTime;
        var m = (y2 - y1) / (x2 - x1);
        var n = (m * x1 - y1) * (-1);
        return function (x) {
            return m * x + n;
        }
    }
}

class SavitzkyGolayPeak extends Peak {
    constructor(data, startTime, endTime, graphName,chromatogram) {

        super(data, startTime, endTime);

        var filterOptionsUV = [{
            windowSize: 9,
            derivative: 0,
            polynomial: 3,
            pad: 'pre'
        }, {
            windowSize: 11,
            derivative: 1,
            polynomial: 3,
            pad: 'pre'
        }, {
            windowSize: 11,
            derivative: 2,
            polynomial: 3,
            pad: 'pre'
        }];

        var filterOptionsCounter = [{
            windowSize: 25,
            derivative: 0,
            polynomial: 3,
            pad: 'pre'
        }, {
            windowSize: 25,
            derivative: 1,
            polynomial: 3,
            pad: 'pre'
        }, {
            windowSize: 11,
            derivative: 2,
            polynomial: 3,
            pad: 'pre'
        }];

        this.graphName = graphName;
        this.filteredData = [];
        this.chromatogram = chromatogram;

        this.projectedDataFiltered=[];
        //Default-Paramters for the data, evaluated by experimenting
        if(typeof(this.chromatogram.tmp) === 'undefined'){
            this.chromatogram.tmp={};
        }

        if (graphName == "Counter") {
            if(typeof(chromatogram.tmp.filteredData) === 'undefined'){
                this.chromatogram.tmp.filteredData={};
            }
            if(typeof(chromatogram.tmp.filteredData[this.graphName]) === 'undefined') {
                this.chromatogram.tmp.filteredData[this.graphName] = [];
                this.chromatogram.tmp.filteredData[this.graphName] = this.filterDataWithOptions(data[0], filterOptionsCounter);
                this.filteredData = this.chromatogram.tmp.filteredData[this.graphName];
            }
            if(typeof(this.chromatogram.tmp.projectedDataFiltered) === 'undefined') {
                this.chromatogram.tmp.projectedDataFiltered={};
            }
            if(typeof(this.chromatogram.tmp.projectedDataFiltered[this.graphName]) === 'undefined') {
                this.chromatogram.tmp.projectedDataFiltered[this.graphName]=[];
                this.chromatogram.tmp.projectedDataFiltered[this.graphName] = this.filterDataWithOptions(this.projectedData[0], filterOptionsCounter);
                this.projectedDataFiltered = this.chromatogram.tmp.projectedDataFiltered[this.graphName];
            }

            this.filteredData = this.chromatogram.tmp.filteredData[this.graphName];
            this.projectedDataFiltered = this.chromatogram.tmp.projectedDataFiltered[this.graphName];

        } else  {
            if(typeof(chromatogram.tmp.filteredData) === 'undefined'){
                this.chromatogram.tmp.filteredData={};
            }
            if(typeof(chromatogram.tmp.filteredData[this.graphName]) === 'undefined') {
                this.chromatogram.tmp.filteredData[this.graphName] = [];
                this.chromatogram.tmp.filteredData[this.graphName] = this.filterDataWithOptions(data[0], filterOptionsUV);
                this.filteredData = this.chromatogram.tmp.filteredData[this.graphName];
            }
            if(typeof(this.chromatogram.tmp.projectedDataFiltered) === 'undefined') {
                this.chromatogram.tmp.projectedDataFiltered={};
            }
            if(typeof(this.chromatogram.tmp.projectedDataFiltered[this.graphName]) === 'undefined') {
                this.chromatogram.tmp.projectedDataFiltered[this.graphName]=[];
                this.chromatogram.tmp.projectedDataFiltered[this.graphName] = this.filterDataWithOptions(this.projectedData[0], filterOptionsUV);
                this.projectedDataFiltered = this.chromatogram.tmp.projectedDataFiltered[this.graphName];
            }

            this.filteredData = this.chromatogram.tmp.filteredData[this.graphName];
            this.projectedDataFiltered = this.chromatogram.tmp.projectedDataFiltered[this.graphName];

        }


    }

    /**
     * Filters the data with the given options. This is Dependent on the used filter.
     * @param data
     * @param options
     * @returns {*}
     */
    filterDataWithOptions(data, options) {
        if (Object.prototype.toString.call(options) === "[object Array]") {
            return options.map(function (inp, idx) {
                return window.SavitzkyGolayFilter(data, inp);
            });
        } else {
            return window.SavitzkyGolayFilter(data, options);
        }
    }

    calculateXAxisIntersection(startTime, endTime, deriv) {
        var data = this.filteredData;
        deriv = (typeof deriv !== 'undefined') ? deriv : 0;

        var y1 = data[deriv][startTime];
        var y2 = data[deriv][endTime];
        var x1 = startTime;
        var x2 = endTime;
        var m = (y2 - y1) / (x2 - x1);
        var n = (m * x1 - y1) * (-1);

        //y=0 => x-axis intersection
        return -n / m;

    }

    /**
     * Calculates the Peak Maximum
     * @returns {*}
     */
    getPeakMaximum() {
        if (this.getPeakMaximum_result !== undefined) {
            return this.getPeakMaximum_result;
        }


        var f_proto = function (x) {
            return this.data[0][x];
        };
        var f_smoothed_proto = function (x) {
            return this.filteredData[0][x];
        };
        var f_prime_proto = function (x) {
            return this.filteredData[1][x];
        };
        var f_double_prime_proto = function (x) {
            return this.filteredData[2][x];
        };
        var f_triple_prime_proto = function (x) {
            return this.filteredData[3][x];
        };
        var f = f_proto.bind(this);
        var f_smoothed = f_smoothed_proto.bind(this);
        var f_prime = f_prime_proto.bind(this);
        var f_double_prime = f_double_prime_proto.bind(this);
        var f_triple_prime = f_triple_prime_proto.bind(this);

        //use analytical methods to calculate the maximum of a peak
        //with f(x)  = measured data at x
        //with f'(x) = first derivative of f at x
        //with f''(x)= second derivative of f at x

        //for a maximum, f'(x) has to be 0, and f''(x) has to be negative

        //since we work with discrete data here, we have to interpolate to calculate the real maximum
        //for further investigation, we calculate the delta of x at the measured maximum of f(x)
        //and the interpolated result of the analytical method

        var result = {
            val: 0,
            f_x: 0,
            f_smoothed_x: 0,
            f_smoothed_interpolated_x: 0,
            f_prime_critera: false
        };

        var measuredMax_x = this.startTime;
        var measuredMax = Number.NEGATIVE_INFINITY;

        var smoothedMax_x = this.startTime;
        var smoothedMax = Number.NEGATIVE_INFINITY;
        for (var x = this.startTime; x < this.endTime; x++) {
            var tmp = f(x);
            if (tmp > measuredMax) {
                measuredMax = tmp;
                measuredMax_x = x;
            }
            if (tmp > smoothedMax) {
                smoothedMax = tmp;
                smoothedMax_x = x;
            }
        }

        result.val = smoothedMax;
        result.f_x = measuredMax_x;
        result.f_smoothed_x = smoothedMax_x;
        result.f_prime_critera = f_prime(smoothedMax_x) < 0 && f_prime(smoothedMax_x - 1) > 0;

        result.f_smoothed_interpolated_x = this.calculateXAxisIntersection(smoothedMax_x - 1, smoothedMax_x + 1, 2);


        this.getPeakMaximum_result = result;

        return result;
    }

    /***
     * Calculates the Maximum for the peak that is projected on a parallel to the x-axis
     * @returns {*}
     */
    getPeakMaximumProjected() {

        if (this.getPeakMaximumProjected_result !== undefined) {
            return this.getPeakMaximumProjected_result;
        }

        var f_proto = function (x) {
            return this.projectedData[0][x];
        };
        var f_smoothed_proto = function (x) {
            return this.projectedDataFiltered[0][x];
        };
        var f_prime_proto = function (x) {
            return this.projectedDataFiltered[1][x];
        };
        var f_double_prime_proto = function (x) {
            return this.projectedDataFiltered[2][x];
        };
        var f_triple_prime_proto = function (x) {
            return this.projectedDataFiltered[3][x];
        };
        var f = f_proto.bind(this);
        var f_smoothed = f_smoothed_proto.bind(this);
        var f_prime = f_prime_proto.bind(this);
        var f_double_prime = f_double_prime_proto.bind(this);
        var f_triple_prime = f_triple_prime_proto.bind(this);

        //use analytical methods to calculate the maximum of a peak
        //with f(x)  = measured data at x
        //with f'(x) = first derivative of f at x
        //with f''(x)= second derivative of f at x

        //for a maximum, f'(x) has to be 0, and f''(x) has to be negative

        //since we work with discrete data here, we have to interpolate to calculate the real maximum
        //for further investigation, we calculate the delta of x at the measured maximum of f(x)
        //and the interpolated result of the analytical method

        var result = {
            val: 0,
            f_x: 0,
            f_smoothed_x: 0,
            f_smoothed_interpolated_x: 0,
            f_prime_critera: false
        };

        var measuredMax_x = this.startTime;
        var measuredMax = Number.NEGATIVE_INFINITY;

        var smoothedMax_x = this.startTime;
        var smoothedMax = Number.NEGATIVE_INFINITY;
        for (var x = this.startTime; x < this.endTime; x++) {
            var tmp = f(x);
            if (tmp > measuredMax) {
                measuredMax = tmp;
                measuredMax_x = x;
            }
            if (tmp > smoothedMax) {
                smoothedMax = tmp;
                smoothedMax_x = x;
            }
        }

        result.val = smoothedMax;
        result.f_x = measuredMax_x;
        result.f_smoothed_x = smoothedMax_x;
        result.f_prime_critera = f_prime(smoothedMax_x) < 0 && f_prime(smoothedMax_x - 1) > 0;

        result.f_smoothed_interpolated_x = this.calculateXAxisIntersection(smoothedMax_x - 1, smoothedMax_x + 1, 2);


        this.getPeakMaximumProjected_result = result;

        return result;
    }

    /**
     *   get the value at projectedData[max]
     *   subtract the interpolation, multiply by heightInPercent,add interpolation,find intersection with data
     *   left and right of max. Returns Peak Symmetry with a being the left part and b being the right part at the specified height
     * @param heightInPercent
     * @returns {{a: number, b: number}}
     */
    getPeakSymmetry(heightInPercent) {
        //get the value at projectedData[max]
        //subtract the interpolation, multiply by heightInPercent,add interpolation,find intersection with data
        // left and right of max

        var max = this.getPeakMaximumProjected();
        var interpolation;

        if(typeof this.chromatogram.Data.Baseline[this.graphName] === 'undefined') {
            interpolation = this.calculateLinearInterpolation(0);
        }
        else
        {
            var bl = new Baseline(this.chromatogram.Data.Baseline[this.graphName]);
            interpolation = bl.calculateAtPointX.bind(bl);
        }


        var h = heightInPercent / 100.0;

        var targetval = (this.projectedData[0][max.f_smoothed_x] - interpolation(max.f_smoothed_x)) * h + interpolation(max.f_smoothed_x);


        var result = {
            a: 0,
            b: 0
        };

        for (var i = this.startTime; i <= this.endTime; i++) {
            if (this.projectedData[0][i] > targetval) {
                //here we check if |this.projectedData[0][i] - targetval| is smaller than |this.projectedData[0][i+1] - targetval|
                //because we're working with discrete data and we want to have small error margins
                if(Math.abs(this.projectedData[0][i] - targetval) > Math.abs(this.projectedData[0][i+1] - targetval)) {
                    result.a = max.f_smoothed_x - i;
                }else{
                    result.a = max.f_smoothed_x - i+1;
                }
                break;
            }
        }
        for (var i = this.endTime; i >= this.startTime; i--) {
            if (this.projectedData[0][i] > targetval) {
                if(Math.abs(this.projectedData[0][i] - targetval) > Math.abs(this.projectedData[0][i-1] - targetval)) {
                    result.b = i - max.f_smoothed_x;
                }else{
                    result.b = i - max.f_smoothed_x + 1;
                }
                break;
            }
        }
        return result;
    }

    getEfficiencyFactor(heightInPercent) {
        var sym = this.getPeakSymmetry(heightInPercent);
        var N = 5.54*Math.pow((this.getPeakMaximumProjected().f_smoothed_x/(sym.a+sym.b)),2);
        return N;
    }

    calculate_retention_factor(deadTime) {
        var max = this.getPeakMaximumProjected();

        if(deadTime != 0) {
            return (max.f_smoothed_x - deadTime) / deadTime;
        }else{
            return max.f_smoothed_x;
        }
    }

    calculatePeakArea() {
        var d = this.data[0];
        var a = 0;
        var factor = 1;
        if(this.chromatogram.Data.Factors[this.graphName] !== undefined){
           factor = this.chromatogram.Data.Factors[this.graphName];
        }
        if(typeof this.chromatogram.Data.Baseline[this.graphName] === 'undefined') {
            var f = this.calculateLinearInterpolation(0);

            for (var i = this.StartTime; i <= this.EndTime; i++) {
                a += (Math.abs(d[i] - f(i)))*factor;
            }
        }
        else
        {

            var bl = new Baseline(this.chromatogram.Data.Baseline[this.graphName]);

            for (var i = this.StartTime; i <= this.EndTime; i++) {
                a += Math.abs(d[i] - bl.calculateAtPointX(i))*factor;
            }

        }

        return a;

    }

    calculatePeakAreaDecayCorrected(halflifeInMinutes){
        var hlSeconds = halflifeInMinutes*60;

        var d = this.data[0];
        var a = 0;
        var factor = 1;
        if(this.chromatogram.Data.Factors[this.graphName] !== undefined){
           factor = this.chromatogram.Data.Factors[this.graphName];
        }
        if(typeof this.chromatogram.Data.Baseline[this.graphName] === 'undefined') {
            var f = this.calculateLinearInterpolation(0);

            for (var i = this.StartTime; i <= this.EndTime; i++) {
                a += (Math.abs(d[i] - f(i)))*factor*Math.exp(Math.log(2)*i/hlSeconds);
            }
        }
        else
        {

            var bl = new Baseline(this.chromatogram.Data.Baseline[this.graphName]);

            for (var i = this.StartTime; i <= this.EndTime; i++) {
                a += Math.abs(d[i] - bl.calculateAtPointX(i))*factor*Math.exp(Math.log(2)*i/hlSeconds);
            }

        }

        return a;
    }

    calculateLinearRegressionForPeak() {
        return this.calculateLinearInterpolation();
    }

    calculateLinearInterpolation(deriv) {
        var data = this.data;
        deriv = (typeof deriv !== 'undefined') ? deriv : 0;

        var y1 = data[deriv][this.startTime];
        var y2 = data[deriv][this.endTime];
        var x1 = this.startTime;
        var x2 = this.endTime;
        var m = (y2 - y1) / (x2 - x1);
        var n = (m * x1 - y1) * (-1);
        return function (x) {
            return m * x + n;
        };
    }

    getName(){
        for(var i=0;i<this.chromatogram.Data.Peaks[this.graphName].length;i++){
            var current = this.chromatogram.Data.Peaks[this.graphName][i];
            if(current.StartTime == this.startTime && current.EndTime == this.endTime)
                return current.Name;
        }
    }

}

class SavitzkyGolayPeakFinding {
    constructor(data, graphName) {
        this.data = [data];
        this.graphName = graphName;

        var smoothedData = [];

        switch (graphName) {
            case "Counter":
                smoothedData = this.filterDataWithOptionsIterative(data, {
                    windowSize: 9,
                    derivative: 0,
                    polynomial: 7,
                    pad: 'pre'
                });

                break;
            default:
               smoothedData = this.filterDataWithOptionsIterative(data, {
                    windowSize: 5,
                    derivative: 0,
                    polynomial: 2,
                    pad: 'pre'
                });

                break;
        }

        var filterOptionsUV = [{
            windowSize: 11,
            derivative: 1,
            polynomial: 3,
            pad: 'pre'
        }, {
            windowSize: 11,
            derivative: 1,
            polynomial: 3,
            pad: 'pre'
        }];

        var filterOptionsCounter = [{
            windowSize: 25,
            derivative: 1,
            polynomial: 3,
            pad: 'pre'
        }, {
            windowSize: 11,
            derivative: 1,
            polynomial: 3,
            pad: 'pre'
        }];


        this.filteredData = [];

        //Default-Paramters for the data, evaluated by experimenting
        if (graphName == "Counter") {
            this.filterDataWithOptionsIterative(smoothedData, filterOptionsCounter).forEach((x) => {
                this.data.push(x);
            });
        } else  {
            this.filterDataWithOptionsIterative(smoothedData, filterOptionsUV).forEach((x) => {
                this.data.push(x);
            });
        }
    }

    filterDataWithOptionsIterative(data, options) {
        if (Object.prototype.toString.call(options) === "[object Array]") {
            var result = [];
            for (var i = 0; i < options.length; i++) {
                var d = data;
                if (i > 0) {
                    d = result[i - 1];
                }
                result.push(window.SavitzkyGolayFilter(d, options[i]));
            }
            return result;
        } else {
            return window.SavitzkyGolayFilter(data, options);
        }
    }

    findPeaks(deadTime, peakMinWidth, plateauDetectionDiff) {
        var result = [];
        peakMinWidth = (typeof peakMinWidth !== 'undefined') ? peakMinWidth : 10;
        plateauDetectionDiff = (typeof plateauDetectionDiff !== 'undefined') ? plateauDetectionDiff : 0.95;


        var possiblePeaks = [];
        for (var i = deadTime; i < this.data[0].length; i++) {
            if (this.data[1][i] > 0 && this.data[1][i + 1] < 0) {
                if (this.data[2][i] < 0) {
                    possiblePeaks.push(i);
                }
            }
        }


        function containsPeak(arr, start, end) {

            for (var i = 0; i < arr.length; i++) {
                if (arr[i].StartTime == start || arr[i].EndTime == end) {
                    return true;
                }
            }
            return false;
        }

        for (var i = 0; i < possiblePeaks.length; i++) {
            var currentPeak = possiblePeaks[i];

            var start = 0;
            var end = 0;
            for (var j = currentPeak; j >= deadTime; j--) {
                if ((this.data[1][j] >= 0 && this.data[1][j - 1] <= 0)) {
                    if (this.data[2][j] > 0 && this.data[0][j] <= this.data[0][currentPeak] * plateauDetectionDiff) {
                        start = j;
                        break;
                    }
                }
            }


            for (var j = currentPeak; j < this.data[0].length - 1; j++) {
                if ((this.data[1][j] <= 0 && this.data[1][j + 1] >= 0)) {
                    if (this.data[2][j] > 0 && this.data[0][j] <= this.data[0][currentPeak] * plateauDetectionDiff) {
                        end = j;
                        break;
                    }
                }
            }

            if (start != 0 && end != 0 && start != end && start < end && end - start > peakMinWidth && !containsPeak(result, start, end)) {
                result.push({"StartTime": start, "EndTime": end,"Name":"undefined","Mode":"default"});
            }
        }
        return result;
    }




}