/**
 * Copied and modified from: https://github.com/tradingview/lightweight-charts/blob/f13a3c1f3fefcace9d4da5b97c1638009298b3c8/plugin-examples/src/plugins/stacked-area-series
 * Modifications are called out with comments.
 */

import {
  BitmapCoordinatesRenderingScope,
  CanvasRenderingTarget2D,
} from 'fancy-canvas'
import {
  ICustomSeriesPaneRenderer,
  PaneRendererCustomData,
  PriceToCoordinateConverter,
  Range,
  Time,
} from 'lightweight-charts'

import { StackedAreaData } from './stacked-area-data'
import { StackedAreaSeriesOptions } from './stacked-area-options'

interface Position {
  x: number
  y: number
}

interface LinePathData {
  path: Path2D
  first: Position
  last: Position
}

interface StackedAreaBarItem {
  x: number
  ys: number[]
}

function cumulativeBuildUp(arr: number[]): number[] {
  let sum = 0
  return arr.map((value) => {
    const newValue = sum + value
    sum = newValue
    return newValue
  })
}

function moveYs(
  firstYs: number,
  ys: number,
  verticalPixelRatio: number,
): number {
  return ys * verticalPixelRatio + (ys / firstYs - 1) * 500
}

export class StackedAreaSeriesRenderer<TData extends StackedAreaData>
  implements ICustomSeriesPaneRenderer
{
  _data: PaneRendererCustomData<Time, TData> | null = null
  _options: StackedAreaSeriesOptions | null = null

  draw(
    target: CanvasRenderingTarget2D,
    priceConverter: PriceToCoordinateConverter,
  ): void {
    target.useBitmapCoordinateSpace((scope) =>
      this._drawImpl(scope, priceConverter),
    )
  }

  update(
    data: PaneRendererCustomData<Time, TData>,
    options: StackedAreaSeriesOptions,
  ): void {
    this._data = data
    this._options = options
  }

  _drawImpl(
    renderingScope: BitmapCoordinatesRenderingScope,
    priceToCoordinate: PriceToCoordinateConverter,
  ): void {
    if (
      this._data === null ||
      this._data.bars.length === 0 ||
      this._data.visibleRange === null ||
      this._options === null
    ) {
      return
    }

    const ctx = renderingScope.context

    const options = this._options
    const bars: StackedAreaBarItem[] = this._data.bars.map((bar) => {
      return {
        x: bar.x,
        ys: cumulativeBuildUp(bar.originalData.values).map(
          (value) => priceToCoordinate(value) ?? 0,
        ),
      }
    })
    const zeroY = priceToCoordinate(0) ?? 0
    const { linesMeshed, hoverInfo } = this._createLinePaths(
      bars,
      this._data.visibleRange,
      renderingScope,
      zeroY * renderingScope.verticalPixelRatio,
      options.hoveredLogicalIndex,
    )

    const fullLinesMeshed = linesMeshed.slice(0, 3)
    const highlightLinesMeshed = options.hoveredLogicalIndex
      ? linesMeshed.slice(4)
      : []

    const areaPaths = this._createAreas(fullLinesMeshed)

    const colorsCount = options.colors.length
    const isHovered =
      options.hoveredLogicalIndex && options.hoveredLogicalIndex !== -1
    const isMultichainExploreEnabled = !!options.gradients
    areaPaths.forEach((areaPath, index) => {
      // Modification: determine area fill opacity based on number of lines and hover state

      if (areaPaths.length === 1) {
        ctx.globalAlpha = 0.12 // single-line charts have low opacity fill
      } else if (!isMultichainExploreEnabled) {
        ctx.globalAlpha = isHovered ? 0.24 : 1
      }

      const gradient = options.gradients
        ? ctx.createLinearGradient(
            0,
            0,
            renderingScope.mediaSize.width * 2.25,
            0,
          )
        : undefined
      gradient?.addColorStop(
        0,
        options.gradients?.[index % colorsCount].start ?? 'transparent',
      )
      // End the gradient at the x-coordinate of the crosshair relative to chart width or the end of the chart
      const gradientStop = Math.max(
        hoverInfo.x ? hoverInfo.x / renderingScope.bitmapSize.width : 1,
        0,
      )
      gradient?.addColorStop(
        gradientStop,
        options.gradients?.[index % colorsCount].end ?? 'transparent',
      )

      ctx.fillStyle = gradient ?? options.colors[index % colorsCount]
      ctx.fill(areaPath)
    })

    ctx.lineWidth =
      options.lineWidth *
      (isMultichainExploreEnabled ? 1 : renderingScope.verticalPixelRatio)
    ctx.lineJoin = 'round'
    // @ts-ignore
    fullLinesMeshed.toReversed().forEach((linePath, index) => {
      const unreversedIndex = fullLinesMeshed.length - index
      const color = options.colors[unreversedIndex % colorsCount]
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.globalAlpha = isHovered && isMultichainExploreEnabled ? 0.24 : 1

      // Bottom line is just the x-axis, which should not be drawn
      if (index !== fullLinesMeshed.length - 1) {
        // Line rendering:
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.stroke(linePath.path)
      }

      // Modification: Draws a glyph where lines intersect with the crosshair
      const hoverY = hoverInfo.points[index - 1]
      // Reset the global alpha to 1 after filling in the area under the graph and before drawing the glyph
      ctx.globalAlpha = 1

      // Glyph rendering:
      ctx.globalCompositeOperation = 'destination-out' // This mode allows removing a portion of the drawn line from the canvas
      ctx.beginPath()
      ctx.arc(
        hoverInfo.x,
        hoverY,
        5 * renderingScope.verticalPixelRatio,
        0,
        2 * Math.PI,
      )
      ctx.fill() // Cuts a hole out of the line where part of the glyph should be rendered

      ctx.globalCompositeOperation = 'source-over' // Resets to default mode

      ctx.beginPath()

      ctx.arc(
        hoverInfo.x,
        hoverY,
        3 * renderingScope.verticalPixelRatio,
        0,
        2 * Math.PI,
      )
      ctx.fill() // Draws innermost portion of glyph

      ctx.globalAlpha = 0.2
      ctx.beginPath()
      ctx.arc(
        hoverInfo.x,
        hoverY,
        8 * renderingScope.verticalPixelRatio,
        0,
        2 * Math.PI,
      )
      ctx.fill() // Draws middle portion of glyph

      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.arc(
        hoverInfo.x,
        hoverY,
        12 * renderingScope.verticalPixelRatio,
        0,
        2 * Math.PI,
      )
      ctx.fill() // Draws outer portion of glyph

      ctx.globalAlpha = 1
    })
    // @ts-ignore
    highlightLinesMeshed.toReversed().forEach((linePath, index) => {
      if (!linePath) {
        ctx.globalAlpha = 1
        return
      }
      const unreversedIndex = fullLinesMeshed.length - index
      const color = options.colors[unreversedIndex % colorsCount]
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.globalAlpha = 1

      // Bottom line is just the x-axis, which should not be drawn
      if (index !== fullLinesMeshed.length - 1) {
        // Line rendering:
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.stroke(linePath.path)
      }
    })
  }

  /** Builds canvas line paths based on input data  */
  _createLinePaths(
    bars: StackedAreaBarItem[],
    visibleRange: Range<number>,
    renderingScope: BitmapCoordinatesRenderingScope,
    zeroY: number,
    hoveredIndex?: number | null,
  ) {
    const { horizontalPixelRatio, verticalPixelRatio } = renderingScope
    const oddLines: LinePathData[] = []
    const evenLines: LinePathData[] = []
    const oddHighlightLines: LinePathData[] = []
    const evenHighlightLines: LinePathData[] = []
    let firstBar = true

    // Modification: tracks and returns coordinates of where a glyph should be rendered for each line when a crosshair is drawn
    const hoverInfo = { points: new Array<number>(), x: 0 }
    const firstYs = bars[0].ys[0]

    // Modification: updated loop to include one point above and below the visible range to ensure the line is drawn to edges of chart
    for (let i = visibleRange.from - 1; i < visibleRange.to + 1; i++) {
      if (i >= bars.length || i < 0) {
        continue
      }

      const stack = bars[i]
      let lineIndex = 0
      stack.ys.forEach((yMedia, index) => {
        if (index % 2 !== 0) {
          return // only doing odd at the moment
        }

        const x = stack.x * horizontalPixelRatio
        const y = moveYs(firstYs, yMedia, verticalPixelRatio)

        if (i === hoveredIndex) {
          hoverInfo.points[index] = y
          hoverInfo.x = x
        }

        if (firstBar) {
          oddLines[lineIndex] = {
            path: new Path2D(),
            first: { x, y },
            last: { x, y },
          }
          oddLines[lineIndex].path.moveTo(x, y)
        } else {
          oddLines[lineIndex].path.lineTo(x, y)
          oddLines[lineIndex].last.x = x
          oddLines[lineIndex].last.y = y
        }
        if (firstBar && hoveredIndex && i <= hoveredIndex) {
          oddHighlightLines[lineIndex] = {
            path: new Path2D(),
            first: { x, y },
            last: { x, y },
          }
          oddHighlightLines[lineIndex].path.moveTo(x, y)
        } else if (hoveredIndex && i <= hoveredIndex) {
          oddHighlightLines[lineIndex].path.lineTo(x, y)
          oddHighlightLines[lineIndex].last.x = x
          oddHighlightLines[lineIndex].last.y = y
        }
        lineIndex += 1
      })
      firstBar = false
    }
    firstBar = true
    // Modification: updated loop to include one point above and below the visible range to ensure the line is drawn to edges of chart
    for (let i = visibleRange.to + 1; i >= visibleRange.from - 1; i--) {
      if (i >= bars.length || i < 0) {
        continue
      }
      const stack = bars[i]
      let lineIndex = 0
      stack.ys.forEach((yMedia, index) => {
        if (index % 2 === 0) {
          return // only doing even at the moment
        }

        const x = stack.x * horizontalPixelRatio
        const y = moveYs(firstYs, yMedia, verticalPixelRatio)

        if (i === hoveredIndex) {
          hoverInfo.points[index] = y
          hoverInfo.x = x
        }

        if (firstBar) {
          evenLines[lineIndex] = {
            path: new Path2D(),
            first: { x, y },
            last: { x, y },
          }
          evenLines[lineIndex].path.moveTo(x, y)
        } else {
          evenLines[lineIndex].path.lineTo(x, y)
          evenLines[lineIndex].last.x = x
          evenLines[lineIndex].last.y = y
        }

        if (
          evenHighlightLines.length <= lineIndex &&
          hoveredIndex &&
          i <= hoveredIndex
        ) {
          evenHighlightLines[lineIndex] = {
            path: new Path2D(),
            first: { x, y },
            last: { x, y },
          }
          evenHighlightLines[lineIndex].path.moveTo(x, y)
        } else if (hoveredIndex && i <= hoveredIndex) {
          evenHighlightLines[lineIndex].path.lineTo(x, y)
          evenHighlightLines[lineIndex].last.x = x
          evenHighlightLines[lineIndex].last.y = y
        }

        lineIndex += 1
      })
      firstBar = false
    }

    const baseLine = {
      path: new Path2D(),
      first: { x: oddLines[0].last.x, y: zeroY },
      last: { x: oddLines[0].first.x, y: zeroY },
    }
    baseLine.path.moveTo(oddLines[0].last.x, zeroY)
    baseLine.path.lineTo(oddLines[0].first.x, zeroY)
    const linesMeshed: LinePathData[] = [baseLine]
    for (let i = 0; i < oddLines.length; i++) {
      linesMeshed.push(oddLines[i])
      if (i < evenLines.length) {
        linesMeshed.push(evenLines[i])
      }
      if (hoveredIndex) {
        linesMeshed.push(oddHighlightLines[i])
        linesMeshed.push(evenHighlightLines[i])
      }
    }

    return { linesMeshed, hoverInfo }
  }

  /** Builds canvas area paths to fill under lines */
  _createAreas(linesMeshed: LinePathData[]): Path2D[] {
    const areas: Path2D[] = []
    for (let i = 1; i < linesMeshed.length; i++) {
      const areaPath = new Path2D(linesMeshed[i - 1].path)
      areaPath.lineTo(linesMeshed[i].first.x, linesMeshed[i].first.y)
      areaPath.addPath(linesMeshed[i].path)
      areaPath.lineTo(linesMeshed[i - 1].first.x, linesMeshed[i - 1].first.y)
      areaPath.closePath()
      areas.push(areaPath)
    }
    return areas
  }
}
