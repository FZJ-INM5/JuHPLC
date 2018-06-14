function secondsToHHMMSS(d) {

    d = Number(d);

    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    return /*`00${h}`.slice(-2) + ":" +*/ `00${m}`.slice(-2) + ":" + `00${s}`.slice(-2);
}

function secondsMinutes(d,samplerate) {
    return (d/(60.0*samplerate)).toFixed(3);
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

var distanceFromInterval = function distanceFromInterval(x, left, right) {
    if (x < left) {
        return left - x;
    } else if (x > right) {
        return x - right;
    } else {
        return 0;
    }
};

/**
 * Returns the number of pixels by which the event happens from the nearest
 * edge of the chart. For events in the interior of the chart, this returns zero.
 */
var distanceFromChart = function distanceFromChart(event, g) {
    var chartPos = findPos(g.canvas_);
    var box = {
        left: chartPos.x,
        right: chartPos.x + g.canvas_.offsetWidth,
        top: chartPos.y,
        bottom: chartPos.y + g.canvas_.offsetHeight
    };

    var pt = {
        x: pageX(event),
        y: pageY(event)
    };

    var dx = distanceFromInterval(pt.x, box.left, box.right),
        dy = distanceFromInterval(pt.y, box.top, box.bottom);
    return Math.max(dx, dy);
};
function pageX(e) {
    return !e.pageX || e.pageX < 0 ? 0 : e.pageX;
}
function pageY(e) {
    return !e.pageY || e.pageY < 0 ? 0 : e.pageY;
}

function maybeTreatMouseOpAsClick(event, g, context) {
    context.dragEndX = utils.dragGetX_(event, context);
    context.dragEndY = utils.dragGetY_(event, context);
    var regionWidth = Math.abs(context.dragEndX - context.dragStartX);
    var regionHeight = Math.abs(context.dragEndY - context.dragStartY);

    if (regionWidth < 2 && regionHeight < 2 &&
        g.lastx_ !== undefined && g.lastx_ != -1) {
        DygraphInteraction.treatMouseOpAsClick(g, event, context);
    }

    context.regionWidth = regionWidth;
    context.regionHeight = regionHeight;
}

function findPos(obj) {
    var p = obj.getBoundingClientRect(),
        w = window,
        d = document.documentElement;

    return {
        x: p.left + (w.pageXOffset || d.scrollLeft),
        y: p.top + (w.pageYOffset || d.scrollTop)
    };
}