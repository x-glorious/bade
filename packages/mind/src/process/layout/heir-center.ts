// 直系子代居中对齐布局
import * as dagre from 'dagre'

import { Mind } from '../../index'
import { Process } from '../index'
import { generateDagreGraphic } from './dagre'

export class HeirCenterLayout implements Process.Lifecycle {
  private graphic: dagre.graphlib.Graph
  private cacheMap: Mind.CacheMap
  private root: Mind.Root
  private options: Required<Mind.Options>

  start = (context: Process.StartContext) => {
    const { options, root, cacheMap } = context
    this.root = root
    this.cacheMap = cacheMap
    this.options = options
    this.graphic = generateDagreGraphic(options)
  }

  every = (context: Process.EveryContext) => {
    const { cache } = context
    const { node, parent } = cache
    this.graphic.setNode(node.id, cache.rect)

    if (parent) {
      if (cache.orientation === Mind.Orientation.positive) {
        this.graphic.setEdge(parent.id, node.id)
      } else {
        this.graphic.setEdge(node.id, parent.id)
      }
    }
  }

  end = () => {
    // 计算关系
    dagre.layout(this.graphic)
    const rootCache = this.cacheMap.get(this.root.node.id)!
    // 存储整体布局尺寸
    const graph = this.graphic.graph()
    rootCache.layoutSize = {
      height: graph.height!,
      width: graph.width!
    }
  }
}
