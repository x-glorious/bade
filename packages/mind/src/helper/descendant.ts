import { Mind } from '../index'

/**
 * 获取某个节点的所有后代
 * @param node 节点
 */
export const descendant = (node: Mind.Node) => {
  const result: Mind.Node[] = []

  const recursion = (nodes: Mind.Node[] = []) => {
    for (const disposeNode of nodes) {
      result.push(disposeNode)
      recursion(disposeNode.children)
    }
  }
  recursion(node.children)
  return result
}
