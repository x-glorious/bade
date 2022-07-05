import { merge } from 'lodash'

import { BadeMind } from '../index'

export const transformRootToWalkable = (root: BadeMind.Root) => {
  const negative = root.negative || []
  const positive = root.positive || []

  const shadowNode: BadeMind.Node = {
    ...root.node
  }
  shadowNode.children = [...negative, ...positive]
  const cache = new Map<string, BadeMind.Orientation>()
  negative.forEach((item) => cache.set(item.id, BadeMind.Orientation.negative))
  positive.forEach((item) => cache.set(item.id, BadeMind.Orientation.positive))

  return {
    getRootHeirOrientation: (id: string) => cache.get(id)!,
    shadowNode
  }
}
