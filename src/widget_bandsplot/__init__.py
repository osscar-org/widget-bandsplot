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

    bands = tl.List([]).tag(sync=True)
    dos = tl.Dict().tag(sync=True)
    energy_range = tl.List([-10.0, 10.0]).tag(sync=True)
    dos_range = tl.List([]).tag(sync=True)
    bands_color = tl.List([]).tag(sync=True)

    # Formatting settings:
    # * showFermi
    # * showLegend
    # * bandsYlabel
    format_settings = tl.Dict({}).tag(sync=True)

    def __init__(
        self,
        **kwargs,
    ):
        """The traitlets defined above are possible kwargs."""
        super().__init__(**kwargs)
