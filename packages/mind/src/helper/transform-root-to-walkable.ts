import { merge } from 'lodash'

import { Mind } from '../index'

export const transformRootToWalkable = (root: Mind.Root) => {
  const negative = root.negative || []
  const positive = root.positive || []

  const shadowNode: Mind.Node = {
    ...root.node
  }
  shadowNode.children = [...negative, ...positive]
  const cache = new Map<string, Mind.Orientation>()
  negative.forEach((item) => cache.set(item.id, Mind.Orientation.negative))
  positive.forEach((item) => cache.set(item.id, Mind.Orientation.positive))

  return {
    getRootHeirOrientation: (id: string) => cache.get(id)!,
    shadowNode
  }
}
