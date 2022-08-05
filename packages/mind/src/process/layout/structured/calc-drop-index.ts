import { Mind } from '../../../index'
import { DraggableLayout } from '../type'

export const calcDropIndex: typeof DraggableLayout.calcDropIndex = (context) => {
  const { attachedNodeChildren, dropPosition, options, cacheMap, dragNode, attachedNode } = context
  // 节点没有子代，则，拖拽节点自动为第一个节点
  // 当子代被折叠的时候，自动作为第一个节点
  if (!attachedNodeChildren || attachedNodeChildren.length === 0 || attachedNode.fold) {
    return 0
  }

  const vertical = options.direction === Mind.Direction.y
  const dragNodeJudgeValue = vertical ? dropPosition.x : dropPosition.y

  const getNodeJudgeValue = (id: string) => {
    const cache = cacheMap.get(id)!
    const rect = cache.rect
    return vertical ? rect.x : rect.y
  }

  // 处理边界情况
  if (dragNodeJudgeValue <= getNodeJudgeValue(attachedNodeChildren[0].id)) {
    return attachedNodeChildren[0].id === dragNode.id ? -1 : 0
  }
  if (
    dragNodeJudgeValue >=
    getNodeJudgeValue(attachedNodeChildren[attachedNodeChildren.length - 1].id)
  ) {
    return attachedNodeChildren[attachedNodeChildren.length - 1].id === dragNode.id
      ? -1
      : attachedNodeChildren.length
  }

  for (let index = 1; index < attachedNodeChildren.length; index++) {
    if (
      dragNodeJudgeValue >= getNodeJudgeValue(attachedNodeChildren[index - 1].id) &&
      dragNodeJudgeValue <= getNodeJudgeValue(attachedNodeChildren[index].id)
    ) {
      if (
        attachedNodeChildren[index - 1].id === dragNode.id ||
        attachedNodeChildren[index].id === dragNode.id
      ) {
        return -1
      }
      return index
    }
  }

  return -1
}
