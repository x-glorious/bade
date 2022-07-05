import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Process } from './index'

export class Line implements Process.Lifecycle {
  private cacheMap: BadeMind.CacheMap
  private options: BadeMind.Options
  private root: BadeMind.Root
  private getRootHeirOrientation: Process.getRootHeirOrientationFunc

  start = (context: Process.StartContext) => {
    const { cacheMap, options, root, getRootHeirOrientation } = context
    this.cacheMap = cacheMap
    this.options = options
    this.root = root
    this.getRootHeirOrientation = getRootHeirOrientation
  }

  end = () => {
    Helper.breadthFirstWalkTree(this.cacheMap.get(this.root.node.id)!.node, {
      after: () => {},
      before: (node) => {
        const cache = this.cacheMap.get(node.id)!

        if (
          !cache ||
          Helper.judgeIfHeirAndFold(node, cache.parent, this.root, this.getRootHeirOrientation)
        ) {
          return false
        }

        if (cache.parent) {
          const parentCache = this.cacheMap.get(cache.parent.id)!

          if (this.options.direction === BadeMind.Direction.x) {
            cache.line.source.y = parentCache.rect.y
            cache.line.target.y = cache.rect.y
            // 节点位于父级右侧
            if (cache.orientation === BadeMind.Orientation.positive) {
              cache.line.source.x = parentCache.rect.x + parentCache.rect.width / 2
              cache.line.target.x = cache.rect.x - cache.rect.width / 2
            }
            // 节点位于父级左侧
            else {
              cache.line.source.x = parentCache.rect.x - parentCache.rect.width / 2
              cache.line.target.x = cache.rect.x + cache.rect.width / 2
            }
          } else {
            cache.line.source.x = parentCache.rect.x
            cache.line.target.x = cache.rect.x
            // 节点位于上方
            if (cache.orientation === BadeMind.Orientation.positive) {
              cache.line.source.y = parentCache.rect.y - parentCache.rect.height / 2
              cache.line.target.y = cache.rect.y + cache.rect.height / 2
            }
            // 节点位于下方
            else {
              cache.line.source.y = parentCache.rect.y + parentCache.rect.height / 2
              cache.line.target.y = cache.rect.y - cache.rect.height / 2
            }
          }
        }
        return !Helper.judgeIfAllChildFold(node, this.root.node.id)
      }
    })
  }
}
