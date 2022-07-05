import { WithDefault } from '../default'
import { Zoom } from '../graphic/zoom'
import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Process } from '../process'

export const layout = (context: {
  cacheMap: BadeMind.CacheMap
  options: Required<BadeMind.Options>
  root: BadeMind.Root
  container: HTMLElement
  viewport: HTMLElement
  transform: BadeMind.Transform
  anchor?: string
  zoom: Zoom
}) => {
  const { cacheMap, options, root, container, viewport, transform, anchor, zoom } = context
  const preCacheMap = new Map(cacheMap)
  cacheMap.clear()

  const processes: Process.Lifecycle[] = [
    new Process.NodeValid(),
    new Process.Orientation(),
    new Process.Size(),
    new (Process.getLayoutProcess(options))(),
    new Process.Line(),
    new Process.Anchor()
  ]

  const { shadowNode, getRootHeirOrientation } = Helper.transformRootToWalkable(root)

  // 处理器执行开始事件
  processes.forEach(
    (item) =>
      item.start &&
      item.start({
        anchor,
        cacheMap,
        container,
        getRootHeirOrientation,
        options,
        preCacheMap,
        root,
        transform,
        viewport,
        zoom
      })
  )

  // 深度遍历树
  Helper.depthFirstWalkTree(shadowNode, {
    after: (node, parent) => {
      // 此处处理根节点只有左侧折叠或者右侧折叠的情况
      if (Helper.judgeIfHeirAndFold(node, parent, root, getRootHeirOrientation)) {
        return
      }

      const context: Process.EveryContext = {
        cache: cacheMap.get(node.id)!
      }
      // 依次执行处理器
      processes.forEach((item) => item.afterEvery && item.afterEvery(context))
    },
    before: (node, parent) => {
      // 此处处理根节点只有左侧折叠或者右侧折叠的情况
      if (Helper.judgeIfHeirAndFold(node, parent, root, getRootHeirOrientation)) {
        return false
      }

      // ... 是为了避免引用同一对象
      const cache = preCacheMap.get(node.id)
        ? { ...preCacheMap.get(node.id)! }
        : WithDefault.cache()
      cache.node = node
      cache.parent = parent
      // 缓存信息
      cacheMap.set(node.id, cache)

      const context: Process.EveryContext = {
        cache
      }
      // 依次执行处理器
      processes.forEach((item) => item.every && item.every(context))
      // 如果节点被折叠，则，其子代不纳入后续处理
      return !Helper.judgeIfAllChildFold(node, root.node.id)
    }
  })

  // 处理器执行结束事件
  processes.forEach((item) => item.end && item.end())
}
