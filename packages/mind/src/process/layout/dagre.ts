import * as dagre from 'dagre'

import { Mind } from '../../index'

export const generateDagreGraphic = (options: Mind.Options) => {
  const DirectionToRankdir = {
    [Mind.Direction.x]: 'LR',
    [Mind.Direction.y]: 'BT'
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
