import * as echarts from "echarts/core"
import {CanvasRenderer} from 'echarts/renderers'
import {LabelLayout, UniversalTransition} from 'echarts/features';
import {BarChart, LineChart, PieChart} from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  TransformComponent
} from 'echarts/components';

echarts.use([
  PieChart,
  LineChart,
  BarChart,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  CanvasRenderer,
  LabelLayout,
  UniversalTransition
])
