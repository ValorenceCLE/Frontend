import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { SVGRenderer } from 'echarts/renderers';
import { LineChart, BarChart, GaugeChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, AxisPointerComponent, TitleComponent, LegendComponent } from "echarts/components";

use([
    CanvasRenderer,
    SVGRenderer,
    LineChart,
    BarChart,
    GaugeChart,
    GridComponent,
    TooltipComponent,
    AxisPointerComponent,
    TitleComponent,
    LegendComponent
])