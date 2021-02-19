var plugin = require('./index');
var base = require('@jupyter-widgets/base');

module.exports = {
  id: 'widget-bandsplot:plugin',
  requires: [base.IJupyterWidgetRegistry],
  activate: function(app, widgets) {
      widgets.registerWidget({
          name: 'widget-bandsplot',
          version: plugin.version,
          exports: plugin
      });
  },
  autoStart: true
};

