// src/utils/echarts.js
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from "echarts/components";

// Only load the components we actually use
use([
  CanvasRenderer,
  LineChart,
  GaugeChart, 
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
]);