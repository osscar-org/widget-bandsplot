# `widget-bandsplot`: Jupyter Widget to Plot Band Structure and Density of States

[![PyPI version](https://badge.fury.io/py/widget-bandsplot.svg)](https://badge.fury.io/py/widget-bandsplot)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/osscar-org/widget-bandsplot/main?labpath=%2Fexample%2Fexample.ipynb)
[![screenshot comparison](https://github.com/osscar-org/widget-bandsplot/actions/workflows/screenshot-comparison.yml/badge.svg)](https://github.com/osscar-org/widget-bandsplot/actions/workflows/screenshot-comparison.yml)

A Jupyter widget to plot band structures and density of states. The widget is using the [mc-react-bands](https://github.com/materialscloud-org/mc-react-bands) Javascript package and is turned into a Jupyter widget with [anywidget](https://anywidget.dev/).

<img src="./example/demo.gif" width='1200'>

## Installation

```sh
pip install widget-bandsplot
```

## Usage

Minimal usage example of the widget is the following:

```python
widget = BandsPlotWidget(
    bands = [bands_data],
    dos = dos_data,
    energy_range = [-10.0, 10.0],
    format_settings = {
        "showFermi": True,
        "showLegend": True,
    }
)
display(widget)
```

where `bands_data` and `dos_data` are contain the band structure and density of states data, respectively. The format for these data objects is the following:

- Band structure data follows the [AiiDA CLI](https://aiida.readthedocs.io/projects/aiida-core/en/latest/reference/command_line.html#reference-command-line) export format that can be generated from an [AiiDA BandsData](https://aiida.readthedocs.io/projects/aiida-core/en/v2.6.2/topics/data_types.html#topics-data-types-materials-bands) node with the following command:
  ```bash
  verdi data band export <PK> --format=json
  ```
- The density of states data uses a custom format, with a a valid example being:
  ```python
  dos_data = {
      "fermi_energy": -7.0,
      "dos": [
          {
              "label": "Total DOS",          # required
              "x": [0.0, 0.1, 0.2],          # required
              "y": [1.2, 3.2, 0.0],          # required
              "lineStyle": "dash",           # optional
              "borderColor": "#41e2b3",      # optional
              "backgroundColor": "#51258b",  # optional
          },
          {
              "label": "Co",
              "x": [0.0, 0.1, 0.2],
              "y": [1.2, 3.2, 0.0],
              "lineStyle": "solid",
              "borderColor": "#43ee8b",
              "backgroundColor": "#59595c",
          },
      ],
  }
  ```

For more detailed usage, see `example/example.ipynb` and for more example input files see `example/data`.

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

### Github workflow testing

[![screenshot comparison](https://github.com/osscar-org/widget-bandsplot/actions/workflows/screenshot-comparison.yml/badge.svg)](https://github.com/osscar-org/widget-bandsplot/actions/workflows/screenshot-comparison.yml)

The `screenshot comparison` test will generate images of the widget using `selenium` and `chrome-driver`, and compares them to the reference image in `test/widget-sample.png`.

To update the reference image: download the generated image from the Github Workflow step called "Upload screenshots" and replace `test/widget-sample.png`.

## Acknowledgements

We acknowledge support from the EPFL Open Science Fund via the [OSSCAR](http://www.osscar.org) project.

<img src='https://www.osscar.org/_images/logos.png' width='1200'>
