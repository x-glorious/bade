import { Mind } from '../index'

/**
 * 深度优先遍历
 * @param root 根节点
 * @param callback before:递归之前(返回 true 代表继续搜索子代，false代表终止),after:子代递归完成返回
 */
export const depthFirstWalkTree = (
  root: Mind.Node,
  callback: {
    before: (node: Mind.Node, parent?: Mind.Node) => boolean
    after: (node: Mind.Node, parent?: Mind.Node) => void
  }
) => {
  const recursion = (now: Mind.Node, parent?: Mind.Node) => {
    if (callback.before(now, parent)) {
      ;(now.children || []).forEach((n) => recursion(n, now))
    }
    callback.after(now, parent)
  }
  recursion(root, undefined)
}
