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

import macaronDark from '@/styles/echarts-theme/macarons-dark.json'
import macaron from '@/styles/echarts-theme/macarons.json'

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

echarts.registerTheme('dark', macaronDark)
echarts.registerTheme('light', macaron)
