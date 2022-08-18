import json
from importlib import resources

import jsonschema
import pytest


@pytest.fixture(scope="module")
def pdos_schema():
    with resources.open_text("widget_bandsplot.schemas", "pdos.json") as fh:
        return json.load(fh)


def test_valid_pdos_default(pdos_schema):
    data = {
        "fermi_energy": -7.0,
        "tdos": {
            "label": "Total DOS",
            "x": [0.0, 0.1, 0.2],
            "y": [1.2, 3.2, 0.0],
            "borderColor": "#41e2b3",
            "backgroundColor": "#51258b",
            "lineStyle": "dash",
        },
        "pdos|Co|s|up": {
            "label": "Co_s(up)",
            "x": [0.0, 0.1, 0.2],
            "y": [1.2, 3.2, 0.0],
            "lineStyle": "solid",
            "borderColor": "#43ee8b",
            "backgroundColor": "#59595c",
        },
        "pdos|Co|d|dn": {
            "label": "Co_d(dn)",
            "x": [0.0, 0.1, 0.2],
            "y": [1.2, 3.2, 0.0],
            "lineStyle": "solid",
            "borderColor": "#403bae",
            "backgroundColor": "#a16c5e",
        },
    }
    jsonschema.validate(instance=data, schema=pdos_schema)
