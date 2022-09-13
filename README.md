**widget-bandsplot**: Jupyter Widget to Plot Bandstructure and Density of States
===============================
[![PyPI version](https://badge.fury.io/py/widget-bandsplot.svg)](https://badge.fury.io/py/widget-bandsplot)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/osscar-org/widget-bandsplot/binder?labpath=examples%2Fbandsplot-example.ipynb)

A Jupyter widget to plot bandstructures and density of states. The widget is using the
[bands-widget](https://github.com/materialscloud-org/bands-widget) Javascript package,
which is developed by Materials Cloud group.

<img src="./examples/widget-bandsplot.gif" height="350">

Installation
------------

To install use pip:

    $ pip install widget_bandsplot

Usage
-----

### 1. Plot both the band structure and the density of states (DOS) side by side

```python
w = BandsPlotWidget(bands=[banddata1, banddata2], dos=dosdata, plot_fermilevel = True, show_legend = True, energy_range = {"ymin": -10.0, "ymax": 10.0})
display(w)
```

In order to plot the bandstructure and density of states fiugres, one needs
to provide band data and DOS data as JSON-files. The examples of the input
JSON-files are provided in the `test/data` folder. The JSON-files for the
bandstructure can be exported with the [AiiDA command line interface (CLI) `verdi`](https://aiida.readthedocs.io/projects/aiida-core/en/latest/reference/command_line.html#reference-command-line) as demonstrated in
the code below:

```bash
verdi data band export PK --format=json
```

One can plot several bandstructure input files together with the
"widget-bandsplot". However, one can only give one input file
for the density of states. The format of the DOS input JSON-file is
shown below:

```bash
    dos_data = {
        "fermi_energy": -7.0,
        "dos": [
            {
                "label": "Total DOS",
                "x": [0.0, 0.1, 0.2],
                "y": [1.2, 3.2, 0.0],
                "borderColor": "#41e2b3",
                "backgroundColor": "#51258b",
                "lineStyle": "dash",
            },
            {
                "label": "Co (s↑)",
                "x": [0.0, 0.1, 0.2],
                "y": [1.2, 3.2, 0.0],
                "lineStyle": "solid",
                "borderColor": "#43ee8b",
                "backgroundColor": "#59595c",
            },
            {
                "label": "Co (s↓)",
                "x": [0.0, 0.1, 0.2],
                "y": [1.2, 3.2, 0.0],
                "lineStyle": "solid",
                "borderColor": "#403bae",
                "backgroundColor": "#a16c5e",
            },
        ],
    }
```

### 2. Plot only the bandstructure

```python
w = BandsPlotWidget(bands=[banddata1, banddata2], plot_fermilevel = True, show_legend = True, energy_range = {"ymin": -10.0, "ymax": 10.0})
display(w)
```

### 3. Plot only the density of states (DOS)

```python
w = BandsPlotWidget(dos=dosdata, plot_fermilevel = True, show_legend = True, energy_range = {"ymin": -10.0, "ymax": 10.0})
display(w)
```

When only plotting the density of states, the plot will be shown in
horizontal format.

For developers
-------------

For a development installation (requires [Node.js](https://nodejs.org) and [Yarn version 1](https://classic.yarnpkg.com/)),

    $ git clone https://github.com/osscar/widget-bandsplot.git
    $ cd widget-bandsplot
    $ pip install -e .
    $ jupyter nbextension install --py --symlink --overwrite --sys-prefix widget_bandsplot
    $ jupyter nbextension enable --py --sys-prefix widget_bandsplot

When actively developing your extension for JupyterLab, run the command:

    $ jupyter labextension develop --overwrite widget_bandsplot

Then you need to rebuild the JS when you make a code change:

    $ cd js
    $ yarn run build

You then need to refresh the JupyterLab page when your javascript changes.


## Acknowledgements

We acknowledge support from the EPFL Open Science Fund via the [OSSCAR](http://www.osscar.org) project.

<img src='https://www.osscar.org/_images/logos.png' width='700'>
