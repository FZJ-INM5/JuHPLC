class Baseline {


    /**
     * Creates a new Baseline-Object that can be used to calculate further data
     * @param data the object containing a property named DatetimeValue of type string and a property Type of type string
     * @constructor
     */
    constructor(data) {
        this.data = data;

        this.x_values = [];
        this.y_values = [];
        var d = this.data.DatetimeValue.split(',');

        for (let i = 0; i < d.length; i += 2) {
            this.x_values.push(parseFloat(d[i]));
            this.y_values.push(parseFloat(d[i + 1]));
        }
        this.ks = CSPL.getNaturalKs(this.x_values, this.y_values);
    }

    /**
     * Returns the Value of the Baseline at time x
     * @param x
     */
    calculateAtPointX(x) {


        switch (this.data.Type) {
            case 'linear':
                let i = 0;
                for(i=0;i<this.x_values.length;i++){
                    if(this.x_values[i] <= x && this.x_values[i+1] >= x) {
                        break;
                    }
                }
                var x1 = this.x_values[ i ];
                var y1 = this.y_values[ i ];
                var x2 = this.x_values[i+1];
                var y2 = this.y_values[i+1];

                var res = (y2-y1)/(x2-x1)*(x-x1)+y1;

                return res;
            case 'cubic-spline':
                return CSPL.evalSpline(x,this.x_values,this.y_values,this.ks);
        }
    }

    getValues(){
        var x_values = [];
        var y_values = [];
        var data = this.data.DatetimeValue.split(',');

        for (var i = 0; i < data.length; i += 2) {
            x_values.push(parseFloat(data[i]));
            y_values.push(parseFloat(data[i + 1]));
        }
        return [x_values,y_values];
    }

}


function sortBaselineString(str) {
    let splitted = str.split(",");
    let tmp = [];
    let result = "";
    for (let i = 0; i < splitted.length; i += 2) {
        let px = parseFloat(splitted[i]);
        let py = parseFloat(splitted[i + 1]);
        if(!isNaN(px) && !isNaN(py)) {
            tmp.push({x: px, y: py});
        }
    }
    tmp.sort(function (a, b) {
        if (a.x < b.x) {
            return -1;
        }
        if (a.x > b.x) {
            return 1;
        }
        return 0;
    });

    for (let i = 0; i < tmp.length; i++) {
        result += tmp[i].x + "," + tmp[i].y;
        if (i < tmp.length - 1) {
            result += ",";
        }
    }
    return result;
}

function removeClosestPointFromBaselineString(str,g,domx,domy){

    console.log("we want to remove a point close to ("+domx+"|"+domy+")");
    //sort first, so we know we have an ordered array


    let splitted = sortBaselineString(str).split(",");
    let tmp = [];
    let result = "";
    for (let i = 0; i < splitted.length; i += 2) {
        let px = parseFloat(splitted[i]);
        let py = parseFloat(splitted[i + 1]);
        if(!isNaN(px) && !isNaN(py)) {
            tmp.push({x: px, y: py});
        }
    }
    console.log("our baseline consists of",tmp);

    let diff=Number.MAX_VALUE;
    let toRemove = -1;
    for(let i=0;i<tmp.length;i++){

        var d = Math.sqrt(Math.pow(tmp[i].x-domx,2)+Math.pow(tmp[i].y-domy,2));
        if(d<diff){
            diff=d;
            toRemove = i;
        }
    }
    console.log("Closest point with a distance of "+diff+" is ("+tmp[toRemove].x+"|"+tmp[toRemove].y+")");
    if(toRemove !== -1){
        tmp.splice(toRemove,1);
    }

    for (let i = 0; i < tmp.length; i++) {
        result += tmp[i].x + "," + tmp[i].y;
        if (i < tmp.length - 1) {
            result += ",";
        }
    }
    return result;
}