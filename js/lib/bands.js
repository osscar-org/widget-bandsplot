
var BandPlot = require('./bandstructure').BandPlot;
var getPathStringFromPathArray = require('./bandstructure').getPathStringFromPathArray;
var getValidPointNames = require('./bandstructure').getValidPointNames;
var getPathArrayFromPathString = require('./bandstructure').getPathArrayFromPathString;

// require('bootstrap');
var $ = require('jquery');
require('chartjs-plugin-zoom');

plots = {};

//It updates the band graph for user input.
function changeBandPath(textBoxId, plotInfoId) {
    var theTextBox = document.getElementById(textBoxId);
    var string = theTextBox.value;
    var finalPath = getPathArrayFromPathString(string);
    plots[plotInfoId].plotObj.updateBandPlot(finalPath);
}

//It updates the band graph for to its default path.
function resetDefaultBandPath(textBoxId, plotInfoId) {
    var theTextBox = document.getElementById(textBoxId);
    theTextBox.value = getPathStringFromPathArray(plots[plotInfoId].plotObj.getDefaultPath());
    plots[plotInfoId].plotObj.updateBandPlot(plots[plotInfoId].plotObj.getDefaultPath(), true);
}

//It updates the band graph for to its default path.
function resetZoom(plotInfoId) {
    // Note: call the resetZoom of he plotObj, not directly the call of the plotObj.myChart
    plots[plotInfoId].plotObj.resetZoom();
}

// Swiches to drag-to-zoom mode
var dragToZoom = function (plotInfoId, zoomButtonId, panButtonId) {
    $("#" + zoomButtonId).addClass('btn-primary');
    $("#" + zoomButtonId).removeClass('btn-default');
    $("#" + panButtonId).addClass('btn-default');
    $("#" + panButtonId).removeClass('btn-primary');

    plots[plotInfoId].plotObj.myChart.options.pan = {
        enabled: false,
        mode: "y"
    };
    plots[plotInfoId].plotObj.myChart.options.zoom = {
        enabled: true,
        mode: "y",
        drag: true
    };
    plots[plotInfoId].plotObj.myChart.update();
}

// Swiches to drag-to-zoom mode
function dragToPan(plotInfoId, zoomButtonId, panButtonId) {
    $("#" + panButtonId).addClass('btn-primary');
    $("#" + panButtonId).removeClass('btn-default');
    $("#" + zoomButtonId).addClass('btn-default');
    $("#" + zoomButtonId).removeClass('btn-primary');

    plots[plotInfoId].plotObj.myChart.options.pan = {
        enabled: true,
        mode: "y"
    };
    plots[plotInfoId].plotObj.myChart.options.zoom = {
        enabled: false,
        mode: "y",
        drag: true
    };
    plots[plotInfoId].plotObj.myChart.update();
}

// get json data and create band plot
function bandPlot(bandDivId, bandPathTextBoxId, dataFilePaths, dosFile, colorInfo) {
    plots[bandDivId] = {};

    var b = window.performance.now();
    console.log("start time: plotting band plot: current time => ", bandDivId, b);

    // create band plot object
    var theBandPlot = new BandPlot(bandDivId, 5.1, { "ymin": -20, "ymax": 32 });
    var colorDict;

    // add data for every band structure
    dataFilePaths.forEach(function (dataFilePath, dataIdx) {
        var colorDict;
        if (colorInfo !== undefined) {
            var newColor = tinycolor(colorInfo[dataIdx]);
            colorDict = [newColor.toHexString(), newColor.darken(20).toHexString(), newColor.brighten(20).toHexString()];
        }

        theBandPlot.addBandStructure(dataFilePath, colorDict);
    });

    theBandPlot.addDos(dosFile);
    // update band structure data for plotting
    theBandPlot.updateBandPlot();

    // theBandPlot.myChart.options.pan.enabled = true ;
    // theBandPlot.myChart.options.pan.mode = "y";

    // theBandPlot.myChart.options.zoom.enabled = true;
    // theBandPlot.myChart.options.zoom.mode = "y";
    // theBandPlot.myChart.options.zoom.drag = true;

    // theBandPlot.myChart.update();

    var theTextBox = document.getElementById(bandPathTextBoxId);
    theTextBox.value = getPathStringFromPathArray(theBandPlot.getDefaultPath());

    theTextBox.onkeyup = function () {
        var theTextBox = document.getElementById(bandPathTextBoxId);
        var string = theTextBox.value;
        var finalPath = getPathArrayFromPathString(string);
        theBandPlot.updateBandPlot(finalPath);
    }

    var helperString = "Use - to define a segment<br>Use | to split the path.<br>Valid point names:<br>";
    var validPoints = getValidPointNames(theBandPlot.allData);
    helperString += validPoints.join(', ');

    plots[bandDivId].plotObj = theBandPlot;

    var theResetButton = document.getElementById(bandDivId + "bt-reset");
    theResetButton.onclick = function () {
        var theTextBox = document.getElementById(bandPathTextBoxId);
        theTextBox.value = getPathStringFromPathArray(theBandPlot.getDefaultPath());
        theBandPlot.updateBandPlot(theBandPlot.getDefaultPath(), true);
    }

    var theResetZoomButton = document.getElementById(bandDivId + "bt-resetZoom");
    theResetZoomButton.onclick = function () {
        theBandPlot.resZoom();
    }

    var theDragPanButton = document.getElementById(bandDivId + "bt-dragPan");
    theDragPanButton.onclick = function () {
        $("#" + bandDivId + "bt-dragPan").addClass("button");
        $("#" + bandDivId + "bt-dragPan").removeClass("button-white");
        $("#" + bandDivId + "bt-dragZoom").addClass("button-white");
        $("#" + bandDivId + "bt-dragZoom").removeClass("button");

        theBandPlot.myChart.options.pan = {
            enabled: true,
            mode: "y",
            onPanComplete: function(chart) {
                theBandPlot.myDos.options.scales.yAxes[0].ticks.min = theBandPlot.myChart.options.scales.yAxes[0].ticks.min;
                theBandPlot.myDos.options.scales.yAxes[0].ticks.max = theBandPlot.myChart.options.scales.yAxes[0].ticks.max;
                theBandPlot.myDos.update();
            }
        };

        theBandPlot.myChart.options.zoom = {
            enabled: false,
            mode: "y",
            drag: true
        };

        theBandPlot.myChart.update();

        theBandPlot.myDos.options.pan = {
            enabled: true,
            mode: "y",
            onPanComplete: function(chart) {
                theBandPlot.myChart.options.scales.yAxes[0].ticks.min = theBandPlot.myDos.options.scales.yAxes[0].ticks.min;
                theBandPlot.myChart.options.scales.yAxes[0].ticks.max = theBandPlot.myDos.options.scales.yAxes[0].ticks.max;
                theBandPlot.myChart.update();
            }
        };

        theBandPlot.myDos.options.zoom = {
            enabled: false,
            mode: "y",
            drag: true
        };

        theBandPlot.myDos.update();
    }

    var theDragZoomButton = document.getElementById(bandDivId + "bt-dragZoom");
    theDragZoomButton.onclick = function () {
        $("#" + bandDivId + "bt-dragZoom").addClass("button");
        $("#" + bandDivId + "bt-dragZoom").removeClass("button-white");
        $("#" + bandDivId + "bt-dragPan").addClass("button-white");
        $("#" + bandDivId + "bt-dragPan").removeClass("button");

        theBandPlot.myChart.options.pan = {
            enabled: false,
            mode: "y"
        };

        theBandPlot.myChart.options.zoom = {
            enabled: true,
            mode: "y",
            drag: true,
            onZoomComplete: function(chart) {
                theBandPlot.myDos.options.scales.yAxes[0].ticks.min = theBandPlot.myChart.options.scales.yAxes[0].ticks.min;
                theBandPlot.myDos.options.scales.yAxes[0].ticks.max = theBandPlot.myChart.options.scales.yAxes[0].ticks.max;
                theBandPlot.myDos.update();
            }
        };

        theBandPlot.myChart.update();

        theBandPlot.myDos.options.pan = {
            enabled: false,
            mode: "y"
        };

        theBandPlot.myDos.options.zoom = {
            enabled: true,
            mode: "y",
            drag: true,
            onZoomComplete: function(chart) {
                theBandPlot.myChart.options.scales.yAxes[0].ticks.min = theBandPlot.myDos.options.scales.yAxes[0].ticks.min;
                theBandPlot.myChart.options.scales.yAxes[0].ticks.max = theBandPlot.myDos.options.scales.yAxes[0].ticks.max;
                theBandPlot.myChart.update();
            }
        };

        theBandPlot.myDos.update();
    }

    // $(theTextBox).data('bs.tooltip', false).tooltip({title: helperString, html: true})
    //                        .tooltip('show'); // Open the tooltip

    console.log("end time: plotting band plot: current time, total time => ", bandDivId, window.performance.now(), window.performance.now() - b);
}


module.exports = {
    bandPlot: bandPlot,
}