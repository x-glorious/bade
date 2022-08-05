import { Helper } from '../helper'
import { Mind } from '../index'
import { Zoom } from './zoom'

export const nodeTranslateTo = (
  context: {
    id: string
    cacheMap: Mind.CacheMap
    diff: Mind.Coordinate
    relative: Mind.Relative
    viewport: HTMLElement
    transform: Mind.Transform
    zoom: Zoom
  },
  duration?: number
) => {
  const { id, cacheMap, diff, relative, viewport, transform, zoom } = context
  const cache = cacheMap.get(id)

  if (!cache) {
    throw Helper.error('id match is not exist or folded')
  } else {
    const viewportSize: Mind.Size = {
      height: viewport.clientHeight,
      width: viewport.clientWidth
    }
    const relativeCoordinate: Mind.Coordinate = {
      x: 0,
      y: 0
    }
    const nodeToScreenCoordinate: Mind.Coordinate = {
      x: cache.rect.x * transform.scale,
      y: cache.rect.y * transform.scale
    }

    switch (relative.x) {
      case Mind.RelativeX.left:
        relativeCoordinate.x = 0
        break
      case Mind.RelativeX.middle:
        relativeCoordinate.x = viewportSize.width / 2
        break
      case Mind.RelativeX.right:
        relativeCoordinate.x = viewportSize.width
        break
    }

    switch (relative.y) {
      case Mind.RelativeY.top:
        relativeCoordinate.y = 0
        break
      case Mind.RelativeY.middle:
        relativeCoordinate.y = viewportSize.height / 2
        break
      case Mind.RelativeY.bottom:
        relativeCoordinate.y = viewportSize.height
        break
    }

    zoom.setTransform(
      {
        scale: transform.scale,
        x: relativeCoordinate.x - nodeToScreenCoordinate.x + diff.x,
        y: relativeCoordinate.y - nodeToScreenCoordinate.y + diff.y
      },
      duration
    )
  }
}
