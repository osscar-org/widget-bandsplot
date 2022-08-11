import os
from distutils import log
from os.path import join as pjoin
from pathlib import Path

from jupyter_packaging import (
    combine_commands,
    create_cmdclass,
    ensure_targets,
    get_version,
    install_npm,
)
from setuptools import find_packages, setup

here = os.path.dirname(os.path.abspath(__file__))

log.set_verbosity(log.DEBUG)
log.info("setup.py entered")
log.info("$PATH=%s" % os.environ["PATH"])

name = "widget_bandsplot"
LONG_DESCRIPTION = "A Jupyter widget to plot bandstructures."

# Get widget_bandsplot version
version = get_version(pjoin(name, "_version.py"))

js_dir = pjoin(here, "js")

# Representative files that should exist after a successful build
jstargets = [
    pjoin(js_dir, "dist", "index.js"),
]

data_files_spec = [
    (
        "share/jupyter/nbextensions/widget-bandsplot",
        "widget_bandsplot/nbextension",
        "*.*",
    ),
    (
        "share/jupyter/labextensions/widget-bandsplot",
        "widget_bandsplot/labextension",
        "**",
    ),
    ("share/jupyter/labextensions/widget-bandsplot", ".", "install.json"),
    ("etc/jupyter/nbconfig/notebook.d", ".", "widget-bandsplot.json"),
]

cmdclass = create_cmdclass("jsdeps", data_files_spec=data_files_spec)
cmdclass["jsdeps"] = combine_commands(
    install_npm(js_dir, npm=["yarn"], build_cmd="build:prod"),
    ensure_targets(jstargets),
)

TOP_DIR = Path(__file__).resolve().parent

with open(TOP_DIR.joinpath("requirements.txt")) as handle:
    BASE = [f"{_.strip()}" for _ in handle.readlines() if " " not in _]

with open(TOP_DIR.joinpath("requirements_dev.txt")) as handle:
    DEV = [f"{_.strip()}" for _ in handle.readlines()]

setup_args = dict(
    name=name,
    version=version,
    description="A Jupyter widget to plot bandstructures.",
    long_description=LONG_DESCRIPTION,
    include_package_data=True,
    install_requires=BASE,
    extras_require={"dev": DEV},
    packages=find_packages(),
    zip_safe=False,
    cmdclass=cmdclass,
    author="Dou Du",
    author_email="dou.du@epfl.ch",
    url="https://github.com/osscar-org/widget-bandsplot",
    keywords=[
        "ipython",
        "jupyter",
        "widgets",
    ],
    classifiers=[
        "Development Status :: 4 - Beta",
        "Framework :: IPython",
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Topic :: Multimedia :: Graphics",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
    ],
)

setup(**setup_args)
