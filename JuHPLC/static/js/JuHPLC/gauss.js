function gauss(m,sigma,t){
    return (1/(sigma*Math.sqrt(2*Math.PI)))*Math.pow(Math.E,-0.5*Math.pow(((t-m)/sigma),2));
}

function generateGaussPeakData(m,sigma,factor){
    var result = [];
    for(var i=0;i<2*m;i++){
        result.push(gauss(m,sigma,i)*factor);
    }
    return result;
}

function generateGaussPeakDataFronting(m,sigma,factor){
    var result = [];
    for(var i=0;i<2*m;i++){
        result.push(gauss(m,sigma,i)*factor);
    }
    return result;
}
function generateGaussPeakDataTailing(m,sigma,factor){
    var result = [];
    for(var i=0;i<2*m;i++){
        var val;
        if(i < m) {
            val = gauss(m, sigma, i)/gauss(m, sigma, m) * factor;
        }else{
            val = gauss(m, sigma, i)/gauss(m, sigma, m) * factor;
        }
        result.push(val);
    }
    return result;
}

function addSeries(a,b){
    var result = [];

    for(var i=0;i<Math.max(a.length,b.length);i++) {
        result[i] = 0;
        if (i < a.length){
            result[i] += a[i];
        }
        if(i < b.length) {
            result[i] += b[i];
        }
    }
    return result;
}

/*
Testing with gauss peaks:
delete window.chromatogram.tmp.dygraphsData;
Vue.set(window.chromatogram.Data.Data.UV,0,generateGaussPeakData(5*60,50,10000));
delete window.chromatogram.Data.Baseline.UV;
window.app.$eventHub.$emit('resizeGraphs');
 */