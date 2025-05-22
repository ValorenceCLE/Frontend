// src/utils/echarts.js - OPTIMIZED
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { 
  LineChart, 
  GaugeChart 
} from 'echarts/charts';
import { 
  GridComponent, 
  TooltipComponent, 
  TitleComponent, 
  LegendComponent,
  ToolboxComponent,    // ADD: Used in HistoricalChart for save/zoom tools
  DataZoomComponent    // ADD: Used in HistoricalChart for zoom functionality
} from "echarts/components";

// Only load the components we actually use
use([
  CanvasRenderer,
  LineChart,
  GaugeChart, 
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,    // For Historical chart toolbox
  DataZoomComponent    // For Historical chart zoom
]);