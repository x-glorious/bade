import { Zoom } from '../graphic/zoom'
import { Mind } from '../index'
import { Process } from './index'

export class Anchor implements Process.Lifecycle {
  private preAnchorRect?: Mind.Size & Mind.Coordinate
  private anchor?: string
  private cacheMap: Mind.CacheMap
  private transform: Mind.Transform
  private zoom: Zoom
  private viewport: HTMLElement
  private root: Mind.Root

  start = (context: Process.StartContext) => {
    const { preCacheMap, cacheMap, anchor, transform, zoom, viewport, root } = context
    this.anchor = anchor
    this.cacheMap = cacheMap
    this.transform = transform
    this.zoom = zoom
    this.viewport = viewport
    this.root = root

    if (anchor && preCacheMap!.get(anchor)) {
      this.preAnchorRect = { ...preCacheMap!.get(anchor)!.rect }
    }
  }

  end = () => {
    const anchorCache = this.cacheMap.get(this.anchor || '')

    // 在经历数据改变，布局重计算之后，锚点依然存在，则，锁定锚点，保持缩放比不变
    if (anchorCache && this.preAnchorRect) {
      const diff: Mind.Coordinate = {
        x: (anchorCache.rect.x - this.preAnchorRect.x) * this.transform.scale,
        y: (anchorCache.rect.y - this.preAnchorRect.y) * this.transform.scale
      }
      this.zoom.setTransform({
        scale: this.transform.scale,
        x: this.transform.x - diff.x,
        y: this.transform.y - diff.y
      })
    }
    // 没有找到任何锚点，则，根节点居中，缩放比归一
    else {
      const rootRect = this.cacheMap.get(this.root.node.id)!
      this.zoom.setTransform({
        scale: 1,
        x: this.viewport.clientWidth / 2 - rootRect.rect.x,
        y: this.viewport.clientHeight / 2 - rootRect.rect.y
      })
    }
  }
}
