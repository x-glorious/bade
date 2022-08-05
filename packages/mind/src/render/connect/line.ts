import * as D3 from 'd3'

import { Mind } from '../../index'

export const line: Mind.PathRender = (context) => {
  const radius = 12

  const { source, target, options } = context
  const middle: Mind.Coordinate = {
    x: (source.x + target.x) / 2,
    y: (source.y + target.y) / 2
  }

  let turning: [number, number] = [0, 0]
  let curveStart: [number, number] = [0, 0]
  let curveControl: [number, number] = [0, 0]
  let curveEnd: [number, number] = [0, 0]
  // x 轴分布
  if (options.direction === Mind.Direction.x) {
    // 同一 y 坐标，则，直线链接
    if (source.y === target.y) {
      return D3.line()([
        [source.x, source.y],
        [target.x, target.y]
      ])!
    }

    turning = [middle.x, source.y]

    // 路径需要往下走
    if (target.y > source.y) {
      curveStart = [middle.x, target.y - radius < source.y ? source.y : target.y - radius]
    }
    // 路径需要往上走
    else {
      curveStart = [middle.x, target.y + radius > source.y ? source.y : target.y + radius]
    }

    // 路径需要往右侧走
    if (target.x > source.x) {
      curveEnd = [middle.x + radius > target.x ? target.x : middle.x + radius, target.y]
    }
    // 路径需要往左侧走
    else {
      curveEnd = [middle.x - radius < target.x ? target.x : middle.x - radius, target.y]
    }

    curveControl = [curveStart[0], curveEnd[1]]
  }
  // y 轴分布
  else {
    // 同一 x 坐标，则，直线链接
    if (source.x === target.x) {
      return D3.line()([
        [source.x, source.y],
        [target.x, target.y]
      ])!
    }

    turning = [source.x, middle.y]

    // 路径往右边走
    if (target.x > source.x) {
      curveStart = [target.x - radius < source.x ? source.x : target.x - radius, middle.y]
    }
    // 路径需要往左边走
    else {
      curveStart = [target.x + radius > source.x ? source.x : target.x + radius, middle.y]
    }

    // 路径往下方走
    if (target.y > source.y) {
      curveEnd = [target.x, middle.y + radius > target.y ? target.y : middle.y + radius]
    }
    // 路径往上方走
    else {
      curveEnd = [target.x, middle.y - radius < target.y ? target.y : middle.y - radius]
    }
    curveControl = [curveEnd[0], curveStart[1]]
  }

  return (
    D3.line()([[source.x, source.y], turning, curveStart])! +
    D3.line().curve(D3.curveBasis)([curveStart, curveControl, curveEnd])! +
    D3.line()([curveEnd, [target.x, target.y]])!
  )
}
