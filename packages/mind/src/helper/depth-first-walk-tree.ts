import { BadeMind } from '../index'

/**
 * 深度优先遍历
 * @param root 根节点
 * @param callback before:递归之前(返回 true 代表继续搜索子代，false代表终止),after:子代递归完成返回
 */
export const depthFirstWalkTree = (
  root: BadeMind.Node,
  callback: {
    before: (node: BadeMind.Node, parent?: BadeMind.Node) => boolean
    after: (node: BadeMind.Node, parent?: BadeMind.Node) => void
  }
) => {
  const recursion = (now: BadeMind.Node, parent?: BadeMind.Node) => {
    if (callback.before(now, parent)) {
      ;(now.children || []).forEach((n) => recursion(n, now))
    }
    callback.after(now, parent)
  }
  recursion(root, undefined)
}
