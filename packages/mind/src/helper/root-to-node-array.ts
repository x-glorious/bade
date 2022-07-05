import { BadeMind } from '../index'

export const rootToNodeArray = (root: BadeMind.Root, callback: (node: BadeMind.Node) => void) => {
  const result: BadeMind.Node[] = []

  callback(root.node)
  result.push(root.node)

  let dispose = [...(root.negative || []), ...(root.positive || [])]
  while (dispose.length) {
    const cache: BadeMind.Node[] = []
    dispose.forEach((item) => {
      callback(item)
      result.push(item)
    })
    dispose.forEach((item) => cache.push(...(item.children || [])))
    dispose = cache
  }

  return result
}
