import { BadeMind } from '../index'

export const breadthFirstWalkTree = (
  node: BadeMind.Node,
  callback: {
    before: (node: BadeMind.Node) => boolean
    after: (rank: BadeMind.Node[]) => void
  }
) => {
  const recursion = (rank: BadeMind.Node[]) => {
    const nextLevel: BadeMind.Node[] = []
    rank.forEach((item) => {
      if (callback.before(item)) {
        nextLevel.push(...(item.children || []))
      }
    })
    if (nextLevel.length) {
      recursion(nextLevel)
    }
    callback.after(rank)
  }
  recursion([node])
}
