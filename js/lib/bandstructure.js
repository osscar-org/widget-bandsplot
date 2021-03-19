/**
 * Display Band structure(s) in single plot
 *
 * @author Giovanni Pizzi, EPFL (2018-2020)
 * @author Snehal Kumbhar, EPFL (2020)
 *
 * @version 1.0 First release to plot single band structure
 * @version 1.1 Added support to plot multiple band structures in single plot
 *
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c), 2018, ECOLE POLYTECHNIQUE FEDERALE DE LAUSANNE
 * (Theory and Simulation of Materials (THEOS) and National Centre for
 * Computational Design and Discovery of Novel Materials (NCCR MARVEL)),
 * Switzerland.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

// Utility 'zip' function analogous to python's, from
// https://stackoverflow.com/questions/4856717

var Chart = require('chart.js');
const { nodeName } = require('jquery');
var tinycolor = require('tinycolor2');
require('chartjs-plugin-zoom');
require('chartjs-plugin-annotation');

var zip = function () {
    var args = [].slice.call(arguments);
    var shortest = args.length === 0 ? [] : args.reduce(function (a, b) {
        return a.length < b.length ? a : b;
    });

    return shortest.map(function (_, i) {
        return args.map(function (array) {
            return array[i];
        });
    });
};

// Utility function to convert a string in a array describing a path
function getPathStringFromPathArray(path) {
    var string = [];
    var lastPoint = "";
    path.forEach(function (thisPath) {
        if (string.length === 0) {
            string += thisPath[0];
            string += "-";
            string += thisPath[1];
        } else {
            if (lastPoint != thisPath[0]) {
                string += "|" + thisPath[0];
            }
            string += "-";
            string += thisPath[1];
        }
        lastPoint = thisPath[1];
    });

    return string;
}

// Utility function to convert an array describing a path in a short string
var getPathArrayFromPathString = function (pathString) {
    var finalPath = [];
    // Each path separated by | can be treated independently and appended
    var independentPieces = pathString.split("|");
    independentPieces.forEach(function (stringPiece) {
        // Split by dash
        var pointsStrings = stringPiece.split('-');
        // remove unneeded spaces, remove empty items (so e.g. X--Y still works as X-Y)
        var pointsTrimmedStrings = pointsStrings.map(function (pointName) {
            return pointName.trim();
        });
        var points = pointsTrimmedStrings.filter(function (pointName) {
            return pointName !== "";
        });

        zip(points.slice(0, points.length - 1), points.slice(1)).forEach(function (pair) {
            finalPath.push([pair[0], pair[1]]);
        });
    });
    return finalPath;
}

// Utility function to get all point labels existing in the data
function getValidPointNames(allData) {
    var validNames = [];
    allData.forEach(function (data) {
        if (data.hasOwnProperty("paths")) {
            data.paths.forEach(function (segment) {
                validNames.push(segment.from);
                validNames.push(segment.to);
            });
        }
    });
    var uniqueNames = Array.from(new Set(validNames));
    uniqueNames.sort(); // in place
    return uniqueNames;
}


/////////////// MAIN CLASS DEFINITION /////////////////
var BandPlot = function (divID, showFermi, yLimit) {
    this.divID = divID;
    this.allData = [];
    this.dosData = {};
    this.allSeries = [];
    this.dosSeries = [];
    this.allColorInfo = [];
    this.dosColorInfo = [];
    this.dosBackgroundColorInfo = [];
    // Keep track of the current path to avoid too many refreshes
    this.currentPath = [];
    this.bandFermiEnergy = null;
    this.dosFermiEnergy = null;
    this.showFermi = showFermi;
    this.yLimit = yLimit;
    this.yLabel = "";

    if (typeof (this.myChart) != "undefined") {
        this.myChart.destroy();
    }
}

BandPlot.prototype.addBandStructure = function (bandsData, colorInfo) {
    // User needs to call updateBandPlot after this call

    // bandData format:
    //   data.Y_label = "The Y label"
    //   data.path = [["G", "M"], ["M", "K"], ["K", "G"]], it's the default path
    //   data.paths = list of segment objects as described here below.
    //     each segment is an object: {from: "G", to: "M", values, x}
    //     - x has length N
    //     - x HAS an offset! You need to remove it if needed
    //     - values has length numbands * x

    // colorInfo format:
    // It is array of 3 colors: [Single, Up, Down]
    //  - Single' color will be used when there is no up/down bands
    //  - 'Up' color for spin up bands
    //  - 'Down' color of spin down bands

    var defaultColors = ['#555555', '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00'];

    if (typeof (colorInfo) === 'undefined') {
        var nextIndex = this.allColorInfo.length;
        var newColor = tinycolor(defaultColors[nextIndex % defaultColors.length]);
        colorInfo = [newColor.toHexString(), newColor.darken(20).toHexString(), newColor.brighten(20).toHexString()];
    }

    this.allColorInfo.push(colorInfo);
    this.allData.push(bandsData);
    this.bandFermiEnergy = bandsData['fermi_level'];
};

BandPlot.prototype.addDos = function (dosData) {
    this.dosData = dosData;

    var Index = 1 + dosData['pdos'].length;
    var defaultColors = ['#555555', '#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'];

    for (let i = 0; i < Index; i++) {
        var newColor = tinycolor(defaultColors[i % defaultColors.length]);
        this.dosColorInfo.push(newColor);
        var bkColor = tinycolor(defaultColors[i % defaultColors.length]);
        bkColor.setAlpha(0.4);
        this.dosBackgroundColorInfo.push(bkColor);
    };

    this.dosFermiEnergy = dosData['fermi_energy'];
};

BandPlot.prototype.initChart = function (ticksData) {

    var bandPlotObject = this;

    var chartOptions = {
        type: 'scatter',
        data: {
            datasets: this.allSeries
        },
        options: {
            legend: {
                display: false
            },
            animation: {
                duration: 0
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
                mode: 'point' // disable any hovering effects
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            elements: {
                line: {
                    tension: 0 // disables bezier curves, for performance
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            tooltips: false,
            scales: {
                xAxes: [{
                    display: true,
                    ticks: {
                        // change the label of the ticks
                        callback: function (value, index, values) {
                            return this.options.customTicks[index].label;
                        }
                    },
                    // Important to set this, will give access to the
                    // ticks in the various callbacks.
                    customTicks: ticksData,
                    afterBuildTicks: function (axis, ticks) {
                        // Must return 'filtered' ticks, i.e. a list of
                        // *positions* of the ticks only. 
                        // Here I instead just discart the old ticks
                        // and create new ones. The label
                        // will be changed in the ticks.callback call.
                        return axis.options.customTicks.map(
                            function (tickInfo) { return tickInfo.value; }
                        );
                    }
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        // change the label of the ticks
                        callback: function (value, index, values) {
                            if (index !== 0 && index != values.length - 1) {
                                return value;
                            }
                        }
                    },
                    scaleLabel: {
                        display: true
                    },
                    gridLines: {
                        display: false
                    }
                }]
            },
            zoom: {
                enabled: true,
                mode: "y",
                drag: true,
                onZoomComplete: function (chart) {
                    if (bandPlotObject.myDos !== undefined) {
                        bandPlotObject.myDos.options.scales.yAxes[0].ticks.min = bandPlotObject.myChart.options.scales.yAxes[0].ticks.min;
                        bandPlotObject.myDos.options.scales.yAxes[0].ticks.max = bandPlotObject.myChart.options.scales.yAxes[0].ticks.max;
                        bandPlotObject.myDos.update();
                    }
                }
            }
        }
    };

    if (bandPlotObject.yLimit) {
        chartOptions.options.scales.yAxes[0].ticks.min = bandPlotObject.yLimit.ymin;
        chartOptions.options.scales.yAxes[0].ticks.max = bandPlotObject.yLimit.ymax;
    }
    if (bandPlotObject.xLimit) {
        chartOptions.options.scales.xAxes[0].ticks.min = bandPlotObject.xLimit.xmin;
        chartOptions.options.scales.xAxes[0].ticks.max = bandPlotObject.xLimit.xmax;
    }
    if (bandPlotObject.yLabel)
        chartOptions.options.scales.yAxes[0].scaleLabel.labelString = bandPlotObject.yLabel;

    console.log("The bandstructure Div ID is:" + this.divID);
    var ctx = document.getElementById(this.divID).getContext('2d');
    bandPlotObject.myChart = new Chart(ctx, chartOptions);
};

BandPlot.prototype.initDosChart = function (orientation = 'vertical') {
    var bandPlotObject = this;

    if (orientation === 'vertical') {
        var annotations = {
            type: 'line',
            id: 'fermiLine',
            scaleID: 'dosA',
            mode: 'horizontal',
            value: 0,
            borderColor: 'red',
            borderWidth: 2,
            label: {
                enabled: true,
                position: "right",
                content: "Fermi",
                xAdjust: 4,
            }
        };

        if (this.showFermi === false) annotations = {};

        dosOptions = {
            type: 'scatter',
            data: {
                datasets: this.dosSeries
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                hover: {
                    animationDuration: 0, // duration of animations when hovering an item
                    mode: null // disable any hovering effects
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
                legend: {
                    display: true,
                    position: 'right',
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                            zeroLineWidth: 2,
                        },
                        ticks: {
                            min: 0.0,
                        }
                    }],
                    yAxes: [{
                        id: 'dosA',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                            tickMarkLength: 0,
                        },
                        ticks: {
                            min: bandPlotObject.yLimit.ymin,
                            max: bandPlotObject.yLimit.ymax,
                            padding: 10,
                            // change the label of the ticks
                            callback: function (value, index, values) {
                                if (index !== 0 && index != values.length - 1) {
                                    return value;
                                }
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Density of States (eV)',
                        }
                    }, {
                        display: true,
                        position: 'left',
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                            tickMarkLength: 0,
                        },
                        ticks: {
                            display: false,
                        }
                    }]
                },
                annotation: {
                    annotations: [annotations]
                },
                elements: {
                    point: { radius: 0 }
                },
                zoom: {
                    enabled: true,
                    mode: "y",
                    drag: true,
                    onZoomComplete: function (chart) {
                        if (bandPlotObject.myChart !== undefined) {
                            bandPlotObject.myChart.options.scales.yAxes[0].ticks.min = bandPlotObject.myDos.options.scales.yAxes[0].ticks.min;
                            bandPlotObject.myChart.options.scales.yAxes[0].ticks.max = bandPlotObject.myDos.options.scales.yAxes[0].ticks.max;
                            bandPlotObject.myChart.update();
                        }
                    }
                }
            },
        };
    } else {
        var annotations = {
            type: 'line',
            id: 'fermiLine',
            scaleID: 'dosA',
            mode: 'vertical',
            value: 0,
            borderColor: 'red',
            borderWidth: 2,
            label: {
                enabled: true,
                position: "top",
                content: "Fermi",
                yAdjust: 4,
            }
        };

        if (this.showFermi === false) annotations = {};

        dosOptions = {
            type: 'scatter',
            data: {
                datasets: this.dosSeries
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                hover: {
                    animationDuration: 0, // duration of animations when hovering an item
                    mode: null // disable any hovering effects
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
                legend: {
                    display: true,
                    position: 'right',
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                            zeroLineWidth: 2,
                            tickMarkLength: 0,
                        },
                        ticks: {
                            min: 0.0,
                            padding: 10,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Density of States',
                        }
                    }],
                    xAxes: [{
                        id: 'dosA',
                        display: true,
                        position: 'right',
                        gridLines: {
                            display: true,
                            drawBorder: true,
                            drawOnChartArea: false,
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'E-Ef (eV)',
                        },
                        ticks: {
                            min: bandPlotObject.yLimit.ymin,
                            max: bandPlotObject.yLimit.ymax,
                            // change the label of the ticks
                            callback: function (value, index, values) {
                                if (index !== 0 && index != values.length - 1) {
                                    return value;
                                }
                            }
                        },
                    }],
                },
                annotation: {
                    annotations: [annotations]
                },
                elements: {
                    point: { radius: 0 }
                },
                zoom: {
                    enabled: true,
                    mode: "x",
                    drag: true,
                    onZoomComplete: function (chart) {
                        if (bandPlotObject.myChart !== undefined) {
                            bandPlotObject.myChart.options.scales.yAxes[0].ticks.min = bandPlotObject.myDos.options.scales.yAxes[0].ticks.min;
                            bandPlotObject.myChart.options.scales.yAxes[0].ticks.max = bandPlotObject.myDos.options.scales.yAxes[0].ticks.max;
                            bandPlotObject.myChart.update();
                        }
                    }
                }
            },
        };

    };

    var ctd = document.getElementById(this.divID + 'dos').getContext('2d');
    bandPlotObject.myDos = new Chart(ctd, dosOptions);

};

BandPlot.prototype.getDefaultPath = function () {
    if (this.allData.length > 0) {
        var currentPathSpecification = this.allData[0].path;
        return currentPathSpecification; // use the default path from the first band structure
    } else {
        return [];
    }
};

BandPlot.prototype.updateBandPlot = function (bandPath, forceRedraw) {

    // used later to reference the object inside subfunctions
    var bandPlotObject = this;
    var currentPathSpecification = null;

    if (forceRedraw === undefined)
        forceRedraw = false;

    var emptyOffset = 0.1; // used when a segment is missing

    // Decide whether to use the default path or the one specified as parameter
    if (typeof (bandPath) === 'undefined') {
        currentPathSpecification = bandPlotObject.getDefaultPath();
    } else {
        currentPathSpecification = bandPath;
    }

    // Check if the path actually changed
    var hasChanged = false;
    if (bandPlotObject.currentPath.length != currentPathSpecification.length) {
        hasChanged = true;
    } else {
        zip(bandPlotObject.currentPath, currentPathSpecification).forEach(function (segmentSpec) {
            // Compare starting points of each segment
            if (segmentSpec[0][0] != segmentSpec[1][0]) {
                hasChanged = true;
            }
            // Compare ending points of each segment
            if (segmentSpec[0][1] != segmentSpec[1][1]) {
                hasChanged = true;
            }
        });
    }
    if ((!hasChanged) && (!forceRedraw)) {
        // do nothing if the path is the same
        return;
    }

    // Store the path in the internal cache
    bandPlotObject.currentPath = currentPathSpecification;

    // Function that picks a given segment among the full list
    // given the two extremes. Return the path subobject and a
    // boolean 'reverse' to say if we have to invert the path
    var pickSegment = function (segmentEdges, paths) {
        for (var i = 0; i < paths.length; i++) {
            var path = paths[i];
            if ((path.from == segmentEdges[0]) && (path.to == segmentEdges[1])) {
                return { 'segment': path, 'reverse': false };
            } else if ((path.from == segmentEdges[1]) && (path.to == segmentEdges[0])) {
                return { 'segment': path, 'reverse': true };
            }
        }
        return null;
    };

    // Clean the plot removing the old bands
    // for (var i = bandPlotObject.myChart.series.length - 1; i>=0 ; i--) {
    //     bandPlotObject.myChart.series[i].remove(redraw=false);
    // }

    // Variable to keep track of the current position along x
    var currentXOffset = 0.0;

    // Array that will contain [position, label] for each high-symmetry point encountered
    var highSymmetryTicks = [];

    // Clean up old series
    bandPlotObject.allSeries = [];

    // Plot each of the segments
    currentPathSpecification.forEach(function (segmentEdges, segment_idx) {
        // Add a new high-symmetry point, if needed
        if (highSymmetryTicks.length === 0) {
            // First segment, add always
            highSymmetryTicks.push([currentXOffset, segmentEdges[0]]);
        } else {
            // Add only if different than the previous point (than, join the string
            // with a pipe)
            if (highSymmetryTicks[highSymmetryTicks.length - 1][1] != segmentEdges[0]) {
                highSymmetryTicks[highSymmetryTicks.length - 1][1] += "|" + segmentEdges[0];
            }
        }

        var segmentFoundOnce = false;
        var thisSegmentLength = null;
        var i;
        // Check which segment we need to plot

        bandPlotObject.allData.forEach(function (bandsData, bandsIdx) {

            var segmentInfo = pickSegment(segmentEdges, bandsData.paths);
            if (segmentInfo) {

                // The segment was found, plot it
                segmentFoundOnce = true;

                // get the x array once, it's the same for all
                // make sure it starts from zero, and possibly reverse it if needed
                // (still will be from zero to a maximum value)
                var xArray = [];
                var xLength = segmentInfo.segment.x.length;
                if (segmentInfo.reverse) {
                    for (i = segmentInfo.segment.x.length - 1; i >= 0; i--) {
                        xArray.push(segmentInfo.segment.x[xLength - 1] - segmentInfo.segment.x[i]);
                    }
                } else {
                    for (i = 0; i < xLength; i++) {
                        xArray.push(segmentInfo.segment.x[i] - segmentInfo.segment.x[0]);
                    }
                }

                // Should I use two colors? (By default, no). This info is returned
                // (in new versions of AiiDA) for each segment
                var twoBandTypes = segmentInfo.segment.two_band_types || false;
                var numBands = segmentInfo.segment.values.length;

                if (thisSegmentLength === null) {
                    // I set the length from the first segment I find
                    thisSegmentLength = xArray[xArray.length - 1];
                }

                // I want all bands in this segment to have the same length;
                // For the first band scalingFactor is ALWAYS 1, for the rest might
                // be different and will be used to rescale the x axis.
                var scalingFactor = 1.0;
                if (xArray[xArray.length - 1] > 0) {
                    scalingFactor = thisSegmentLength / xArray[xArray.length - 1];
                    for (i = 0; i < xArray.length; i++) {
                        xArray[i] *= scalingFactor;
                    }
                }

                // If the path has no length (first point and last point coincide)
                // then I do not print. I check the x value at the last point
                // of xArray (xArray, in the lines above, is defined so that
                // xArray[0] = 0 and xArray[xArray.length-1] is the total
                // length of the array
                if (thisSegmentLength > 0) {

                    // Plot each band of the segment
                    segmentInfo.segment.values.forEach(function (band, band_idx) {
                        var curve = [];
                        var theBand;

                        if (segmentInfo.reverse) {
                            // need to use slice because reverse works in place and
                            // would modify the original array
                            theBand = band.slice().reverse();
                        } else {
                            theBand = band;
                        }

                        // substract fermi energy from all bands
                        if (bandPlotObject.bandFermiEnergy) {
                            var tmp = theBand.map(function (value) {
                                return value - bandPlotObject.bandFermiEnergy;
                            });
                            theBand = tmp;
                        }


                        zip(xArray, theBand).forEach(function (xy_point) {
                            curve.push(
                                { x: xy_point[0] + currentXOffset, y: xy_point[1] });
                        });

                        var colorInfo = bandPlotObject.allColorInfo[bandsIdx];
                        var lineColor = null;
                        if (twoBandTypes) {
                            if (band_idx * 2 < numBands) {
                                // Color for the first half of bands
                                lineColor = colorInfo[1]; // Up color
                            } else {
                                // Color for the second half of bands
                                lineColor = colorInfo[2]; // Down color
                            }
                        } else {
                            lineColor = colorInfo[0]; // Single color when there is no up/down bands
                        }

                        var series = {
                            label: segmentEdges[0] + "-" + segmentEdges[1] + "." + band_idx,
                            //backgroundColor: lineColor,
                            borderColor: lineColor,
                            borderWidth: 2,
                            data: curve,
                            fill: false,
                            showLine: true,
                            pointRadius: 0
                        };

                        bandPlotObject.allSeries.push(series);
                    });
                } else {
                    // If we are here, there is a segment, but its path has zero
                    // length. I skip and I will add the empty Offset only once at the end
                }
            } else {
                // segment is null, no segment was found for this specific bandaData - don't do anything
            }

        });

        // Once I processed *all* band series, I apply a shift to the currentXOffset
        if (!segmentFoundOnce) {
            currentXOffset += emptyOffset;
        } else {
            if (thisSegmentLength > 0) {
                currentXOffset += thisSegmentLength;
            } else {
                currentXOffset += emptyOffset;
            }
        }

        highSymmetryTicks.push([currentXOffset, segmentEdges[1]]);

    });

    // Change labels with correct Greek fonts
    var highSymmetryUpdatedTicks = bandPlotObject.updateTicks(highSymmetryTicks);

    // map ticks into a list of dictionaries, for ease of use later
    var ticksData = highSymmetryUpdatedTicks.map(function (data, idx) {
        return { value: data[0], label: data[1] };
    });


    bandPlotObject.xLimit = { "xmin": 0, "xmax": currentXOffset };

    bandPlotObject.yLabel = bandPlotObject.allData[0].Y_label;
    if (bandPlotObject.yLabel === undefined) {
        bandPlotObject.yLabel = 'Electronic bands (eV)';
    }

    if (bandPlotObject.myChart === undefined) {
        bandPlotObject.initChart(ticksData);
    }
    else {
        // Just update the plot and ticks, do not recreate the whole plot
        bandPlotObject.myChart.options.scales.xAxes[0].customTicks = ticksData;
        bandPlotObject.myChart.data.datasets = bandPlotObject.allSeries;
        bandPlotObject.myChart.options.scales.xAxes[0].ticks.max = currentXOffset;

        bandPlotObject.myChart.update();
    }

};

BandPlot.prototype.updateDosPlot = function (orientation = 'vertical') {
    var bandPlotObject = this;

    // Plot the density of states
    bandPlotObject.dosSeries = [];
    curve = [];
    var totx = bandPlotObject.dosData['tdos']['energy | eV']['data'];
    var toty = bandPlotObject.dosData['tdos']['values']['dos | states/eV']['data'];

    totx.forEach(function (data, i) {
        if (orientation === 'vertical') {
            curve.push({ x: toty[i], y: data - bandPlotObject.dosFermiEnergy });
        } else {
            curve.push({ x: data - bandPlotObject.dosFermiEnergy, y: toty[i] });
        };
    });

    var totdos = {
        borderColor: bandPlotObject.dosColorInfo[0],
        backgroundColor: bandPlotObject.dosBackgroundColorInfo[0],
        borderWidth: 2,
        data: curve,
        fill: true,
        showLine: true,
        pointRadius: 0,
        label: "Total",
    };

    bandPlotObject.dosSeries.push(totdos);

    for (let i = 1; i < bandPlotObject.dosColorInfo.length; i++) {
        curve = [];

        var pdosx = bandPlotObject.dosData['pdos'][i - 1]['energy | eV']['data'];
        var pdosy = bandPlotObject.dosData['pdos'][i - 1]['pdos | states/eV']['data'];

        pdosx.forEach(function (data, k) {
            if (orientation === 'vertical') {
                curve.push({ x: pdosy[k], y: data - bandPlotObject.dosFermiEnergy });
            } else {
                curve.push({ x: data - bandPlotObject.dosFermiEnergy, y: pdosy[k] });
            };
        });

        var pdos = {
            borderColor: bandPlotObject.dosColorInfo[i],
            backgroundColor: bandPlotObject.dosBackgroundColorInfo[i],
            hidden: false,
            borderWidth: 1,
            data: curve,
            fill: true,
            showLine: true,
            pointRadius: 0,
            label: bandPlotObject.dosData['pdos'][i - 1]['kind'] + ' ' + bandPlotObject.dosData['pdos'][i - 1]['orbital'],
        };

        bandPlotObject.dosSeries.push(pdos);
    };

    if (bandPlotObject.myDos === undefined) {
        bandPlotObject.initDosChart(orientation);
    };

    bandPlotObject.myDos.update();
};

// Call the reset zoom function of the chart, but also make sure the x ticks are correctly reset
BandPlot.prototype.resBandZoom = function () {
    var bandPlotObject = this;

    bandPlotObject.myChart.resetZoom();

    // Sometimes these are wrongly set (e.g. if I:
    // 1. zoom
    // 2. change the path to something shorter than the default
    // 3. reset the Zoom). 
    // So, we reset them according to the current path
    bandPlotObject.myChart.options.scales.xAxes[0].ticks.min = bandPlotObject.xLimit.xmin;
    bandPlotObject.myChart.options.scales.xAxes[0].ticks.max = bandPlotObject.xLimit.xmax;
    bandPlotObject.myChart.options.scales.yAxes[0].ticks.min = bandPlotObject.yLimit.ymin;
    bandPlotObject.myChart.options.scales.yAxes[0].ticks.max = bandPlotObject.yLimit.ymax;
    bandPlotObject.myChart.update();
};

BandPlot.prototype.resDosZoom = function (orientation = 'vertical') {
    var bandPlotObject = this;

    bandPlotObject.myDos.resetZoom();

    if (orientation === 'vertical') {
        bandPlotObject.myDos.options.scales.yAxes[0].ticks.min = bandPlotObject.yLimit.ymin;
        bandPlotObject.myDos.options.scales.yAxes[0].ticks.max = bandPlotObject.yLimit.ymax;
    } else {
        bandPlotObject.myDos.options.scales.xAxes[0].ticks.min = bandPlotObject.yLimit.ymin;
        bandPlotObject.myDos.options.scales.xAxes[0].ticks.max = bandPlotObject.yLimit.ymax;
    };

    bandPlotObject.myDos.update();
};

// Update both ticks and vertical lines
// ticks should be in the format [xpos, label]
BandPlot.prototype.updateTicks = function (ticks) {
    // I save the 'this' instance for later reference

    var bandPlotObject = this;
    var i;

    //////////////////// Utility functions ///////////////////
    var labelFormatterBuilder = function (allData, ticks) {
        // Returns a function that is compatible with a
        // labelFormatter of highcharts.
        // In particular matches the x value with the label
        // also converts strings to prettified versions

        // pass both all the data (allData), used for the heuristics below
        // to determine the format for the prettifier, and the ticks array

        var label_info = {};
        for (i = 0; i < ticks.length; i++) {
            label_info[ticks[i][0]] = ticks[i][1];
        }

        // function to prettify strings (in HTML) with the new format defined in SeeK-path
        var prettifyLabelFormat = function (label) {
            label = label.replace(/GAMMA/gi, "Γ");
            label = label.replace(/DELTA/gi, "Δ");
            label = label.replace(/SIGMA/gi, "Σ");
            label = label.replace(/LAMBDA/gi, "Λ");
            label = label.replace(/\-/gi, "—"); // mdash
            label = label.replace(/_(.)/gi, function (match, p1, offset, string) {
                // no need to use break since I am returning
                // I am using Unicode subscript digits due to the lack
                // of support of ChartJS for HTML
                switch (p1) {
                    case "0":
                        return "₀";
                    case "1":
                        return "₁";
                    case "2":
                        return "₂";
                    case "3":
                        return "₃";
                    case "4":
                        return "₄";
                    case "5":
                        return "₅";
                    case "6":
                        return "₆";
                    case "7":
                        return "₇";
                    case "8":
                        return "₈";
                    case "9":
                        return "₉";
                }
                // HTML not supported by ChartJS
                // return "<sub>" + p1 + "</sub>";
                // As a fallback I just print the number
                return p1;
            });
            return label;
        };
        // function to prettify strings (in HTML) with the old legacy format defined in AiiDA
        var prettifyLabelLegacyFormat = function (label) {
            // Replace G with Gamma
            if (label == 'G') {
                label = "Γ";
            }
            label = label.replace(/\-/gi, "—"); // mdash
            // Replace digits with their lower-case version
            label = label.replace(/(\d)/gi, function (match, p1, offset, string) {
                switch (p1) {
                    case "0":
                        return "₀";
                    case "1":
                        return "₁";
                    case "2":
                        return "₂";
                    case "3":
                        return "₃";
                    case "4":
                        return "₄";
                    case "5":
                        return "₅";
                    case "6":
                        return "₆";
                    case "7":
                        return "₇";
                    case "8":
                        return "₈";
                    case "9":
                        return "₉";
                }
                // HTML not supported by ChartJS
                // return "<sub>" + p1 + "</sub>";
                // As a fallback I just print the number
                return p1;
            });
            return label;
        };

        // Some heuristics to decide the prettify format
        // If there is "GAMMA", it is the new format
        // If there is NOT "GAMMA" and there is "G", it's the legacy format
        // If there is not even "G", then to be safe I use the seekpath format
        // that for instance does not make numbers subscripts by default
        var validNames = getValidPointNames([allData]);
        var legacyFormat = false; // some default, should never be used anyway
        if (validNames.findIndex(function (label) {
            return label == "GAMMA";
        }) != -1) {
            // There is 'GAMMA': it is for sure the new format
            legacyFormat = false;
        } else {
            // GAMMA is not there
            if (validNames.findIndex(function (label) {
                return label == "G";
            }) != -1) {
                // there is G: it's the legacy format
                legacyFormat = true;
            } else {
                // There is neither 'GAMMA' nor G: no idea, I assume the new format
                legacyFormat = false;
            }
        }

        var prettifyLabel;
        if (legacyFormat) {
            prettifyLabel = prettifyLabelLegacyFormat;
        } else {
            prettifyLabel = prettifyLabelFormat;
        }

        // return the prettifier function
        return function (label) {
            if (typeof (label) === 'undefined') {
                return label;
            }
            var newLabel = prettifyLabel(label);
            return newLabel;
        };
    };
    ////////////////// END OF UTILITY FUNCTIONS ///////////////////

    var labelFormatter = labelFormatterBuilder(bandPlotObject.allData, ticks);
    return ticks.map(function (tick) {
        return [tick[0], labelFormatter(tick[1])];
    });
};

module.exports = {
    BandPlot: BandPlot,
    getPathStringFromPathArray: getPathStringFromPathArray,
    getValidPointNames: getValidPointNames,
    getPathArrayFromPathString: getPathArrayFromPathString,
}