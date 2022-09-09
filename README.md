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

### 1. Plot both bandstucture and density of states (DOS) side by side

```python
w = BandsPlotWidget(bands=[banddata1, banddata2], dos=dosdata, plot_fermilevel = True, show_legend = True, energy_range = {"ymin": -10.0, "ymax": 10.0})
display(w)
```

In order to plot the bandstructure and density of states fiugres, one needs
to provide band data and DOS data as json files. The examples of the input
json files are given in the `test/data` folder. The json files for the
bandstructure can be exported from the AiiDA verdi program, as demonstrated in
the code below:

```bash
verdi data band export PK --format=json
```

One can plot several bandstructure input files together with the 
"widget-bandsplot".

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

When only plotting the density of states, the figure will be shown in 
horizontal format.

For developer
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
