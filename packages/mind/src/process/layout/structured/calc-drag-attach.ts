import { flip } from 'lodash'

import { Helper } from '../../../helper'
import { BadeMind } from '../../../index'
import { DraggableLayout } from '../type'

export const calcDragAttach: typeof DraggableLayout.calcDragAttach = (context) => {
  const { options, cacheMap, root, canBeAttachedNodes, draggingRect, ignoreNodes } = context
  const vertical = options.direction === BadeMind.Direction.y
  let orientation: BadeMind.Orientation = BadeMind.Orientation.root
  const rootRect = cacheMap.get(root.node.id)!.rect
  const targetLinkPoint: BadeMind.Coordinate = {
    x: 0,
    y: 0
  }

  if (vertical) {
    targetLinkPoint.x = draggingRect.x
    // 上部/正向区域
    if (draggingRect.y + draggingRect.height / 2 < rootRect.y - rootRect.height / 2) {
      orientation = BadeMind.Orientation.positive
      targetLinkPoint.y = draggingRect.y + draggingRect.height / 2
    }
    // 下部/负向区域
    else if (draggingRect.y - draggingRect.height / 2 > rootRect.y + rootRect.height / 2) {
      orientation = BadeMind.Orientation.negative
      targetLinkPoint.y = draggingRect.y - draggingRect.height / 2
    }
  } else {
    targetLinkPoint.y = draggingRect.y
    // 右侧/正向区域
    if (draggingRect.x - draggingRect.width / 2 > rootRect.x + rootRect.width / 2) {
      orientation = BadeMind.Orientation.positive
      targetLinkPoint.x = draggingRect.x - draggingRect.width / 2
    }
    // 左侧/负向区域
    else if (draggingRect.x + draggingRect.width / 2 < rootRect.x - rootRect.width / 2) {
      orientation = BadeMind.Orientation.negative
      targetLinkPoint.x = draggingRect.x + draggingRect.width / 2
    }
  }

  // 没有处于有效的可链接区域，返回undefined
  if (orientation === BadeMind.Orientation.root) {
    return undefined
  }

  let linkNode: BadeMind.Node | undefined = undefined
  let linkPoint: BadeMind.Coordinate | undefined = undefined
  let minMainDistance = Infinity

  for (const node of canBeAttachedNodes) {
    // 过滤忽略节点
    if (ignoreNodes.find((item) => item.id === node.id)) {
      continue
    }

    const cache = cacheMap.get(node.id)

    if (!cache) {
      continue
    }

    // 只有位于同一渲染区域才需要计算
    if (cache.orientation !== BadeMind.Orientation.root && cache.orientation !== orientation) {
      continue
    }

    const rect = cache.rect
    const canBeLinkPoint: BadeMind.Coordinate = {
      x: 0,
      y: 0
    }
    // 计算被链接点坐标
    if (vertical) {
      canBeLinkPoint.x = rect.x

      // 目标节点位于正向区域/根节点上方
      if (orientation === BadeMind.Orientation.positive) {
        canBeLinkPoint.y = rect.y - rect.height / 2

        if (canBeLinkPoint.y < targetLinkPoint.y) {
          continue
        }
      } else {
        canBeLinkPoint.y = rect.y + rect.height / 2

        if (canBeLinkPoint.y > targetLinkPoint.y) {
          continue
        }
      }
    } else {
      canBeLinkPoint.y = rect.y

      // 目标节点位于正向区域/根节点右侧
      if (orientation === BadeMind.Orientation.positive) {
        canBeLinkPoint.x = rect.x + rect.width / 2

        if (canBeLinkPoint.x > targetLinkPoint.x) {
          continue
        }
      } else {
        canBeLinkPoint.x = rect.x - rect.width / 2

        if (canBeLinkPoint.x < targetLinkPoint.x) {
          continue
        }
      }
    }

    let crossBoundary = cache.processCache.structuredLayout.crossBoundary[0]
    // 当前节点为根节点
    if (root.node.id === node.id) {
      crossBoundary =
        orientation === BadeMind.Orientation.negative
          ? cache.processCache.structuredLayout.crossBoundary[0]
          : cache.processCache.structuredLayout.crossBoundary[1]
    }
    // 限定交叉轴范围
    const targetCrossValue = vertical ? draggingRect.x : draggingRect.y
    if (
      targetCrossValue < crossBoundary.min - options.nodeSeparate! / 2 ||
      targetCrossValue > crossBoundary.max + options.nodeSeparate! / 2
    ) {
      continue
    }

    // 主轴距离最近
    const mainDistance = vertical
      ? Math.abs(canBeLinkPoint.y - targetLinkPoint.y)
      : Math.abs(canBeLinkPoint.x - targetLinkPoint.x)
    // 主轴距离最近
    if (mainDistance < minMainDistance) {
      minMainDistance = mainDistance
      linkNode = node
      linkPoint = canBeLinkPoint
    }
  }

  if (linkPoint && linkNode) {
    let children: BadeMind.Node[] = linkNode.children || []

    // 根节点折叠特殊处理
    if (linkNode.id === root.node.id) {
      const fold = root.node.fold || []
      // positive 没被折叠，此时镜像节点位于 positive,检查是否为视觉叶节点使用 positive 子代
      if (!fold[1] && orientation === BadeMind.Orientation.positive) {
        children = root.positive || []
      }
      // negative 没被折叠，此时镜像节点位于 negative,检查是否为视觉叶节点使用 negative 子代
      else if (!fold[0] && orientation === BadeMind.Orientation.negative) {
        children = root.negative || []
      } else {
        children = []
      }
    }

    // 视觉叶节点，主轴距离限制，超出一定比例则视作无效
    if (
      Helper.judgeIfVisualLeaf(linkNode, children) &&
      minMainDistance > options.rankSeparate! * 2
    ) {
      return undefined
    }

    return {
      link: {
        source: linkPoint,
        target: targetLinkPoint
      },
      node: linkNode,
      orientation
    }
  }

  return undefined
}
