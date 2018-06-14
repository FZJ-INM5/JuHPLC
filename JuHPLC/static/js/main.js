var SG = require("ml-savitzky-golay");


function SavitzkyGolayFilter(data,poly,wind,deriv){
var options = {
            windowSize: wind,
            derivative: deriv,
            polynomial: poly,
			pad: 'pre'
        };


return SG(data, 1, options);
}

function GramPoly(i,m,k,s){
    var res = 0;
	if(k == 0 && s == 0)
		return 1;
	if(k == 0)
		return 0;
	
    return (4*k-2)/(k*(2*m-k+1))*(i*GramPoly(i,m,k-1,s) +
            s*GramPoly(i,m,k-1,s-1)) - ((k-1)*(2*m+k))/(k*(2*m-k+1))*GramPoly(i,m,k-2,s);
}

window.GramPoly = GramPoly;
window.SavitzkyGolayFilter=SavitzkyGolayFilter;
