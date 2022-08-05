import { Mind } from '../index'

export const breadthFirstWalkTree = (
  node: Mind.Node,
  callback: {
    before: (node: Mind.Node) => boolean
    after: (rank: Mind.Node[]) => void
  }
) => {
  const recursion = (rank: Mind.Node[]) => {
    const nextLevel: Mind.Node[] = []
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
