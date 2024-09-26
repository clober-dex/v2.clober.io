import { CHART_LOG_INTERVALS } from '@clober/v2-sdk'

import { ResolutionString } from '../public/static/charting_library'

export const SUPPORTED_INTERVALS = [
  ['1', '1m'],
  ['3', '3m'],
  ['5', '5m'],
  ['15', '15m'],
  ['60', '1h'],
  ['240', '4h'],
  ['1D', '1d'],
  ['1W', '1w'],
] as [ResolutionString, CHART_LOG_INTERVALS][]
