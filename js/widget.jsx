import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";

import BandsVisualizer from "mc-react-bands";

// register chart.js plugins
import Chart from "chart.js/auto";

// This line seems to break vscode jupyter visualizer.
// But Jupyter notebook and lab are working correctly.
import zoomPlugin from "chartjs-plugin-zoom";

import annotationPlugin from "chartjs-plugin-annotation";
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);
// ----

function isEmptyObject(obj) {
  return (
    typeof obj === "object" && obj !== null && Object.keys(obj).length === 0
  );
}

function isEmptyList(list) {
  return !list.length;
}

const render = createRender(() => {
  const [bandsDataList, setBandsDataList] = useModelState("bands");
  const [dos, setDos] = useModelState("dos");
  const [energyRange, setEnergyRange] = useModelState("energy_range");
  const [dosRange, setDosRange] = useModelState("dos_range");
  const [bandsColorInfo, setBandsColorInfo] = useModelState("bands_color");
  const [formatSettings, setFormatSettings] = useModelState("format_settings");

  return (
    <BandsVisualizer
      bandsDataList={bandsDataList}
      dosData={dos}
      energyRange={energyRange}
      dosRange={dosRange}
      bandsColorInfo={bandsColorInfo}
      formatSettings={formatSettings}
    />
  );
});

export default { render };
