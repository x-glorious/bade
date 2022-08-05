import { Mind } from '../index'

/**
 * 判断节点是否为视觉上的叶节点
 * - 子代被折叠也算视觉上叶节点
 */
export const judgeIfVisualLeaf = (node: Mind.Node, children?: Mind.Node[]) =>
  !children || children.length === 0 || node.fold
