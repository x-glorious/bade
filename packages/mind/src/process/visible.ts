import { Helper } from '../helper'
import { Mind } from '../index'
import { Process } from './index'

export class Visible implements Process.Lifecycle<void, void, void, Mind.Visible> {
  private viewport: HTMLElement
  private transform: Mind.Transform
  private root: Mind.Root
  private cacheMap: Mind.CacheMap
  private options: Required<Mind.Options>
  private getRootHeirOrientation: Process.getRootHeirOrientationFunc

  start = (context: Process.StartContext) => {
    const { viewport, transform, root, cacheMap, options, getRootHeirOrientation } = context
    this.viewport = viewport
    this.transform = transform
    this.root = root
    this.cacheMap = cacheMap
    this.options = options
    this.getRootHeirOrientation = getRootHeirOrientation
  }

  /**
   * 返回可见是否改变
   * - 使用次返回值得前提是，数据没有出现改变（也就是在viewport尺寸改变或者transform时可以使用）
   */
  end = () => {
    const visibleChange: Mind.Visible = {
      lineAttachParent: false,
      node: false
    }

    const viewportSize: Mind.Size = {
      height: this.viewport.clientHeight,
      width: this.viewport.clientWidth
    }

    // 屏幕坐标转换到绘制坐标系
    const normalizedArea = {
      bottom:
        (viewportSize.height + this.options.viewportPreloadPadding - this.transform.y) /
        this.transform.scale,
      left: (-this.options.viewportPreloadPadding - this.transform.x) / this.transform.scale,
      right:
        (viewportSize.width + this.options.viewportPreloadPadding - this.transform.x) /
        this.transform.scale,
      top: (-this.options.viewportPreloadPadding - this.transform.y) / this.transform.scale
    }

    // 广度优先搜索
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

        const preVisible: Mind.Visible = {
          ...cache.visible
        }

        cache.visible.node = true
        cache.visible.lineAttachParent = true
        const rect = cache.rect

        if (
          rect.x - rect.width / 2 > normalizedArea.right ||
          rect.x + rect.width / 2 < normalizedArea.left ||
          rect.y - rect.height / 2 > normalizedArea.bottom ||
          rect.y + rect.height / 2 < normalizedArea.top
        ) {
          cache.visible.node = false
        }

        if (cache.parent) {
          const lineBelongArea = {
            bottom: Math.max(cache.line.source.y, cache.line.target.y),
            left: Math.min(cache.line.source.x, cache.line.target.x),
            right: Math.max(cache.line.source.x, cache.line.target.x),
            top: Math.min(cache.line.source.y, cache.line.target.y)
          }

          // 连线所属区域超出了可视区域，则直接隐藏连线
          if (
            lineBelongArea.left > normalizedArea.right ||
            lineBelongArea.right < normalizedArea.left ||
            lineBelongArea.bottom < normalizedArea.top ||
            lineBelongArea.top > normalizedArea.bottom
          ) {
            cache.visible.lineAttachParent = false
          }
        }

        // 与之前的可见值比较，观察是否出现了改变
        if (preVisible.node !== cache.visible.node) {
          visibleChange.node = true
        }
        if (preVisible.lineAttachParent !== cache.visible.lineAttachParent) {
          visibleChange.lineAttachParent = true
        }

        // 折叠则不处理
        return !Helper.judgeIfAllChildFold(node, this.root.node.id)
      }
    })

    return visibleChange
  }
}
