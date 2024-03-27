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

### Releasing and publishing a new version

In order to make a new release of the library and publish to PYPI, run

```bash
bumpver update --major/--minor/--patch
```

This will

- update version numbers, make a corresponding `git commit` and a `git tag`;
- push this commit and tag to Github, which triggers the Github Action that makes a new Github Release and publishes the package to PYPI.

## Acknowledgements

We acknowledge support from the EPFL Open Science Fund via the [OSSCAR](http://www.osscar.org) project.

<img src='https://www.osscar.org/_images/logos.png' width='700'>
