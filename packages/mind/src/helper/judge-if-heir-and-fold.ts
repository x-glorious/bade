import { BadeMind } from '../index'
import { Process } from '../process'

/**
 * 判断节点是否为root直系子代并且已经被折叠了
 * @param node
 * @param parent
 * @param root
 * @param getRootHeirOrientation
 */
export const judgeIfHeirAndFold = (
  node: BadeMind.Node,
  parent: BadeMind.Node | undefined,
  root: BadeMind.Root,
  getRootHeirOrientation: Process.getRootHeirOrientationFunc
) => {
  // 是否为根节点直系子代
  const isRootChild = parent?.id === root.node.id
  // 保证后续处理节点的节点都没有被折叠
  // 此处处理根节点只有左侧折叠或者右侧折叠的情况
  if (isRootChild && root.node.fold) {
    // negative 折叠，并且节点为root直系negative
    if (root.node.fold[0] && getRootHeirOrientation(node.id) === BadeMind.Orientation.negative) {
      return true
    }

    // positive 折叠，并且节点为root直系positive
    if (root.node.fold[1] && getRootHeirOrientation(node.id) === BadeMind.Orientation.positive) {
      return true
    }
  }

  return false
}
