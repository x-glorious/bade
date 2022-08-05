import { Helper } from '../../../helper'
import { Mind } from '../../../index'

/**
 * 获取节点交叉轴边界
 * - 如果存在视觉子代，请保证视觉子代边界计算完成
 * @param cache
 * @param children
 * @param vertical
 * @param cacheMap
 */
export const getNodeCrossBoundary = (
  cache: Mind.NodeCache,
  children: Mind.Node[] | undefined,
  vertical: boolean,
  cacheMap: Mind.CacheMap
): Mind.Range<number> => {
  const boundary: Mind.Range<number> = {
    max: Infinity,
    min: -Infinity
  }
  const selfBoundary: Mind.Range<number> = {
    max: Infinity,
    min: -Infinity
  }
  if (vertical) {
    selfBoundary.min = cache.rect.x - cache.rect.width / 2
    selfBoundary.max = cache.rect.x + cache.rect.width / 2
  } else {
    selfBoundary.min = cache.rect.y - cache.rect.height / 2
    selfBoundary.max = cache.rect.y + cache.rect.height / 2
  }

  // 视觉上的叶节点
  if (Helper.judgeIfVisualLeaf(cache.node, children)) {
    return selfBoundary
  } else {
    boundary.min = Math.min(
      cacheMap.get(children![0].id)!.processCache.structuredLayout.crossBoundary[0].min,
      selfBoundary.min
    )
    boundary.max = Math.max(
      cacheMap.get(children![children!.length - 1].id)!.processCache.structuredLayout
        .crossBoundary[0].max,
      selfBoundary.max
    )
  }

  return boundary
}
