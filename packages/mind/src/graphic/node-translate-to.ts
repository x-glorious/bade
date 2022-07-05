import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Zoom } from './zoom'

export const nodeTranslateTo = (
  context: {
    id: string
    cacheMap: BadeMind.CacheMap
    diff: BadeMind.Coordinate
    relative: BadeMind.Relative
    viewport: HTMLElement
    transform: BadeMind.Transform
    zoom: Zoom
  },
  duration?: number
) => {
  const { id, cacheMap, diff, relative, viewport, transform, zoom } = context
  const cache = cacheMap.get(id)

  if (!cache) {
    throw Helper.error('id match is not exist or folded')
  } else {
    const viewportSize: BadeMind.Size = {
      height: viewport.clientHeight,
      width: viewport.clientWidth
    }
    const relativeCoordinate: BadeMind.Coordinate = {
      x: 0,
      y: 0
    }
    const nodeToScreenCoordinate: BadeMind.Coordinate = {
      x: cache.rect.x * transform.scale,
      y: cache.rect.y * transform.scale
    }

    switch (relative.x) {
      case BadeMind.RelativeX.left:
        relativeCoordinate.x = 0
        break
      case BadeMind.RelativeX.middle:
        relativeCoordinate.x = viewportSize.width / 2
        break
      case BadeMind.RelativeX.right:
        relativeCoordinate.x = viewportSize.width
        break
    }

    switch (relative.y) {
      case BadeMind.RelativeY.top:
        relativeCoordinate.y = 0
        break
      case BadeMind.RelativeY.middle:
        relativeCoordinate.y = viewportSize.height / 2
        break
      case BadeMind.RelativeY.bottom:
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
