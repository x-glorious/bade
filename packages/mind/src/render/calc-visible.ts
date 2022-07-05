import { Zoom } from '../graphic/zoom'
import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Process } from '../process'

export const calcVisible = (context: {
  cacheMap: BadeMind.CacheMap
  options: Required<BadeMind.Options>
  root: BadeMind.Root
  container: HTMLElement
  viewport: HTMLElement
  transform: BadeMind.Transform
  zoom: Zoom
}) => {
  const { cacheMap, options, root, container, viewport, transform, zoom } = context
  const process = new Process.Visible()
  const { shadowNode, getRootHeirOrientation } = Helper.transformRootToWalkable(root)
  process.start({
    cacheMap,
    container,
    getRootHeirOrientation,
    options,
    root,
    transform,
    viewport,
    zoom
  })
  return process.end()
}
