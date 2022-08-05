import { Mind } from '../index'

export const rootToNodeArray = (root: Mind.Root, callback: (node: Mind.Node) => void) => {
  const result: Mind.Node[] = []

  callback(root.node)
  result.push(root.node)

  let dispose = [...(root.negative || []), ...(root.positive || [])]
  while (dispose.length) {
    const cache: Mind.Node[] = []
    dispose.forEach((item) => {
      callback(item)
      result.push(item)
    })
    dispose.forEach((item) => cache.push(...(item.children || [])))
    dispose = cache
  }

  return result
}
