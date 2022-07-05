import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Process } from './index'

export class Orientation implements Process.Lifecycle {
  private root: BadeMind.Root
  private getRootHeirOrientation: (id: string) => BadeMind.Orientation
  private cacheMap: BadeMind.CacheMap

  start = (context: Process.StartContext) => {
    const { root, getRootHeirOrientation, cacheMap } = context
    this.root = root
    this.getRootHeirOrientation = getRootHeirOrientation
    this.cacheMap = cacheMap
  }

  every = (context: Process.EveryContext) => {
    const { cache } = context

    // 根节点
    if (!cache.parent) {
      cache.orientation = BadeMind.Orientation.root
    }
    // 根节点直系子代
    else if (cache.parent.id === this.root.node.id) {
      cache.orientation = this.getRootHeirOrientation(cache.node.id)
    }
    // 非根节点直系子代，继承父级
    // 由于是深度优先遍历，故而父节点 cache 早已设置完全
    else {
      cache.orientation = this.cacheMap.get(cache.parent.id)!.orientation
    }
  }
}
