import * as D3 from 'd3'

import { Mind } from '../../index'

export const bezier: Mind.PathRender = (context) => {
  const { source, target, options } = context
  const link = options.direction === Mind.Direction.x ? D3.linkHorizontal() : D3.linkVertical()
  return link({
    source: [source.x, source.y],
    target: [target.x, target.y]
  })!
}
