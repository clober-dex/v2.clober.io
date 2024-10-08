import {
  customSeriesDefaultOptions,
  CustomSeriesOptions,
  Logical,
} from 'lightweight-charts'

export interface StackedAreaSeriesOptions extends CustomSeriesOptions {
  colors: readonly string[]
  lineWidth: number
  gradients?: { start: string; end: string }[]
  // Modification: tracks the hovered data point, used for rendering crosshair
  hoveredLogicalIndex?: Logical
}

export const defaultOptions: StackedAreaSeriesOptions = {
  ...customSeriesDefaultOptions,
  colors: [],
  gradients: undefined,
  lineWidth: 2,
} as const
