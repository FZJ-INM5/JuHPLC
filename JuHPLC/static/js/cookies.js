function setCookie(cname, cvalue, exdays=5000) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function getColorFromCookie(channelName){
    c = getCookie("colors");
    if(c == "")
        return null;
    var splitted = c.split('|');
    for(var i in splitted){
        var line = splitted[i];
        var lsplit = line.split(':');
        if(lsplit[0] == channelName){
            return lsplit[1];
        }
    }
}

function getColorsFromCookie(){
    c = getCookie("colors");
    var result = [];
    if(c == "")
        return [];
    var splitted = c.split('|');
    for(var i in splitted){
        var line = splitted[i];
        var lsplit = line.split(':');
        result.push({channelName:lsplit[0],color:lsplit[1]});
    }
    return result;
}

function setCookieColor(channelName,color){
    var colors = getColorsFromCookie();
    var hasSet=false;
    for(var i=0;i<colors.length;i++){
        if(colors[i].channelName==channelName){
            colors[i].color=color;
            hasSet=true;
        }
    }
    if(!hasSet){
        colors.push({channelName:channelName,color:color});
    }
    var tmpArray=[];
    for(var i in colors){
        tmpArray.push(colors[i].channelName+":"+colors[i].color);
    }

    setCookie("colors",tmpArray.join('|'));
}