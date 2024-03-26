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
  const [bandsDatalist, setBandsDatalist] = useModelState("bands");
  const [dos, setDos] = useModelState("dos");
  const [showFermi, setShowFermi] = useModelState("plot_fermilevel");
  const [showLegend, setShowLegend] = useModelState("show_legend");
  const [yLimit, setYLimit] = useModelState("energy_range");
  const [colorInfo, setColorInfo] = useModelState("bands_color");
  return (
    <BandsVisualizer
      bandsDataList={bandsDatalist}
      dosData={isEmptyObject(dos) ? undefined : dos}
      showFermi={showFermi}
      showLegend={showLegend}
      yLimit={yLimit}
      dosRange={[]}
      colorInfo={isEmptyList(colorInfo) ? undefined : colorInfo}
    />
  );
});

export default { render };
