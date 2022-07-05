import { BadeMind } from '../index'
import { Process } from '../process'
import { Helper } from './index'

/**
 * 获取用于布局计算的子代
 * - 剔除掉被折叠的部分
 * @param node
 * @param rootId
 * @param getRootHeirOrientation
 */
export const getLayoutCalcChildren = (
  node: BadeMind.Node,
  rootId: string,
  getRootHeirOrientation: Process.getRootHeirOrientationFunc
) => {
  // 判断是否所有子代都折叠了
  if (Helper.judgeIfAllChildFold(node, rootId)) {
    return []
  }
  const children = node.children || []
  // 非根节点，则直接返回子代（非根节点只有一侧子代）
  if (node.id !== rootId) {
    return children
  } else {
    const fold = node.fold || []
    // 只有 negative 折叠
    if (fold[0]) {
      return children.filter(
        (item) => getRootHeirOrientation(item.id) === BadeMind.Orientation.positive
      )
    }

    // 只有 positive 折叠
    if (fold[1]) {
      return children.filter(
        (item) => getRootHeirOrientation(item.id) === BadeMind.Orientation.negative
      )
    }

    return children
  }
}
