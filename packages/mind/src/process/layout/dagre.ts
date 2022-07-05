import * as dagre from 'dagre'

import { BadeMind } from '../../index'

export const generateDagreGraphic = (options: BadeMind.Options) => {
  const DirectionToRankdir = {
    [BadeMind.Direction.x]: 'LR',
    [BadeMind.Direction.y]: 'BT'
  }

  const graphic = new dagre.graphlib.Graph()
  graphic.setGraph({
    nodesep: options.nodeSeparate,
    rankdir: DirectionToRankdir[options.direction!],
    ranker: 'tight-tree',
    ranksep: options.rankSeparate
  })

  graphic.setDefaultEdgeLabel(() => ({}))

  return graphic
}
