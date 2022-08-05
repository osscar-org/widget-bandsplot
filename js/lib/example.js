var widgets = require('@jupyter-widgets/base');
var _ = require('lodash');
var $ = require('jquery');

var bandPlot = require('./bands').bandPlot;

require('../css/bands.css');

// See example.py for the kernel counterpart to this file.


// Custom Model. Custom widgets models must at least provide default values
// for model attributes, including
//
//  - `_view_name`
//  - `_view_module`
//  - `_view_module_version`
//
//  - `_model_name`
//  - `_model_module`
//  - `_model_module_version`
//
//  when different from the base class.

// When serialiazing the entire widget state for embedding, only values that
// differ from the defaults will be specified.
var BandsplotModel = widgets.DOMWidgetModel.extend({
    defaults: _.extend(widgets.DOMWidgetModel.prototype.defaults(), {
        _model_name: 'BandsplotModel',
        _view_name: 'BandsplotView',
        _model_module: 'widget-bandsplot',
        _view_module: 'widget-bandsplot',
        _model_module_version: '0.1.0',
        _view_module_version: '0.1.0',
        value: 'Hello World!'
    })
});


// Custom View. Renders the widget model.
var BandsplotView = widgets.DOMWidgetView.extend({
    // Defines how the widget gets rendered into the DOM

    initialize: function () {
        this.uuidCanvas = _.uniqueId('bandsCanvas');
        this.uuidTextbox = _.uniqueId('bandsTextbox');
    },

    render: function () {
        this.value_changed();

        // Observe changes in the value traitlet in Python, and define
        // a custom callback.
        this.model.on('change:value', this.value_changed, this);
        this.model.on('change:plot_fermilevel', this.bandsplot_changed, this);
        this.model.on('change:bands', this.bandsplot_changed, this);
        this.model.on('change:dos', this.bandsplot_changed, this);
        this.model.on('change:energy_range', this.bandsplot_changed, this);
        this.model.on('change:show_legend', this.bandsplot_changed, this);

        var bands = this.model.get('bands');
        var fdos = this.model.get('dos');
        var yLimit = this.model.get('energy_range');
        var showFermi = this.model.get('plot_fermilevel');
        var showLegend = this.model.get('show_legend');

        if (bands.length && !$.isEmptyObject(fdos)) {
            this.$el.html('<div class="all-widget"><div id="bandsplot-div" class="bands-plot"> <canvas id="' + this.uuidCanvas + '"> </canvas> </div>'
                + '<div id="dosplot-div" class="dos-plot"> <canvas id="' + this.uuidCanvas + 'dos"> </canvas> </div>'
                + '<p> <span class="span-label"> Edit the path:</span > <input id="' + this.uuidTextbox + '" class="bands-input" type="text"></input></p>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-reset" class="button"> Reset default path </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-resetZoom" class="button"> Reset zoom </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-dragZoom" class="button"> Drag (or pinch) to zoom </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-dragPan" class="button-white"> Drag to pan </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-togglePdos" class="button"> Toggle PDOS </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-downloadFigure" class="button"> Download Figure </button>'
                + '</div>');
        };

        if (!bands.length && !$.isEmptyObject(fdos)) {
            this.$el.html('<div class="all-widget"><div id="dosplot-div" class="dos-plot-single"> <canvas id="' + this.uuidCanvas + 'dos"> </canvas> </div>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-resetZoom" class="button"> Reset zoom </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-dragZoom" class="button"> Drag (or pinch) to zoom </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-dragPan" class="button-white"> Drag to pan </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-togglePdos" class="button"> Toggle PDOS </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-downloadFigure" class="button"> Download Figure </button>'
                + '</div>');
        };

        if (bands.length && $.isEmptyObject(fdos)) {
            this.$el.html('<div class="all-widget"><div id="bandsplot-div" class="bands-plot-single"> <canvas id="' + this.uuidCanvas + '"> </canvas> </div>'
                + '<p> <span class="span-label"> Edit the path:</span > <input id="' + this.uuidTextbox + '" class="bands-input" type="text"></input></p>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-reset" class="button"> Reset default path </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-resetZoom" class="button"> Reset zoom </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-dragZoom" class="button"> Drag (or pinch) to zoom </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-dragPan" class="button-white"> Drag to pan </button>'
                + '<button type="button" id="' + this.uuidCanvas + 'bt-downloadFigure" class="button"> Download Figure </button>'
                + '</div>');
        };

        that = this;
        $(document).ready(function () {
            bandPlot(that.uuidCanvas, that.uuidTextbox, bands, fdos, showFermi, showLegend, yLimit, ['#000000', '#de2d26', '#444444']);
        });
    },

    value_changed: function () {
        this.el.textContent = this.model.get('value');
    },

    bandsplot_changed: function () {
        var bands = this.model.get('bands');
        var fdos = this.model.get('dos');
        var yLimit = this.model.get('energy_range');
        var showFermi = this.model.get('plot_fermilevel');
        var showLegend = this.model.get('show_legend');

        bandPlot(that.uuidCanvas, that.uuidTextbox, bands, fdos, showFermi, showLegend, yLimit, ['#000000', '#de2d26', '#444444']);
    }
});


module.exports = {
    BandsplotModel: BandsplotModel,
    BandsplotView: BandsplotView
};
