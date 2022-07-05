import * as D3 from 'd3'

import { BadeMind } from '../../index'

export const bezier: BadeMind.PathRender = (context) => {
  const { source, target, options } = context
  const link = options.direction === BadeMind.Direction.x ? D3.linkHorizontal() : D3.linkVertical()
  return link({
    source: [source.x, source.y],
    target: [target.x, target.y]
  })!
}
