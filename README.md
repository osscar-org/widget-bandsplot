# Jupyter widget: Band structure visualizer

[![PyPI version](https://badge.fury.io/py/widget-bandsplot.svg)](https://badge.fury.io/py/widget-bandsplot)

A Jupyter widget to plot band structures and density of states. The widget is using the [mc-react-bands](https://github.com/materialscloud-org/mc-react-bands) Javascript package and is turned into a Jupyter widget with [anywidget](https://anywidget.dev/).

## Installation & usage

```sh
pip install widget-bandsplot
```

For usage examples, see `examples/example.ipynb`.

## Development

Install the python code:

```sh
pip install -e .[dev]
```

You then need to install the JavaScript dependencies and run the development server.

```sh
npm install
npm run dev
```

Open `examples/example.ipynb` in Jupyter notebook or lab to start developing. Changes made in `js/` will be reflected in the notebook.

## Acknowledgements

We acknowledge support from the EPFL Open Science Fund via the [OSSCAR](http://www.osscar.org) project.

<img src='https://www.osscar.org/_images/logos.png' width='700'>
