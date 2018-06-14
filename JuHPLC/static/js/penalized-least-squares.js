
function penalizedLeastSquares(y,lambda){
    let m = y.length;
    let D=math.eye(m-1,m,'sparse');

    D = math.multiply(D,-1);

    for(let i=0;i<m-1;i++){
        D=math.subset(D, math.index(i, i+1), 1);
    }

    let E = math.eye(m,m,'sparse');
    let d_trans = math.transpose(D);
    let DtD = math.multiply(d_trans,D);
    DtD = math.multiply(lambda,DtD);

    let res = math.add(DtD,E);

    return math.transpose(math.lusolve(res,y)).toArray()[0];
}

function differentiate(dataseries){
    let result = [];
    for(let i=1;i<dataseries.length;i++){
        result.push((dataseries[i]-dataseries[i-1]));
    }
    return result;
}