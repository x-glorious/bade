import { BadeMind } from '../index'

/**
 * 判断节点是否所有子代都需要被折叠
 * @param node
 * @param rootId
 */
export const judgeIfAllChildFold = (node: BadeMind.Node, rootId: string) => {
  if (node.id === rootId) {
    return (
      !!node.fold &&
      Array.from(node.fold as boolean[]).length > 0 &&
      Array.from(node.fold as boolean[]).every((item) => item)
    )
  } else {
    return !!node.fold
  }
}
