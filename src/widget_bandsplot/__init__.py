import importlib.metadata
import pathlib

import anywidget
import traitlets as tl

try:
    __version__ = importlib.metadata.version("widget_bandsplot")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"


class BandsPlotWidget(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "static" / "widget.js"
    _css = pathlib.Path(__file__).parent / "static" / "widget.css"

    # List of bandstructure data objects
    bands = tl.List([]).tag(sync=True)
    # DOS data object
    dos = tl.Dict().tag(sync=True)
    # Visiblity for the Fermi energy level
    plot_fermilevel = tl.Bool(False).tag(sync=True)
    # The Legend for the density of states
    show_legend = tl.Bool(False).tag(sync=True)
    # yLimit for the plot
    energy_range = tl.Dict({"ymin": -10.0, "ymax": 10.0}).tag(sync=True)
    # The colors for bands data
    bands_color = tl.List([]).tag(sync=True)

    def __init__(
        self,
        **kwargs,
    ):
        """The traitlets defined above are possible kwargs."""
        super().__init__(**kwargs)
