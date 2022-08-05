import { Zoom } from '../graphic/zoom'
import { Helper } from '../helper'
import { Mind } from '../index'
import { Process } from '../process'

export const calcVisible = (context: {
  cacheMap: Mind.CacheMap
  options: Required<Mind.Options>
  root: Mind.Root
  container: HTMLElement
  viewport: HTMLElement
  transform: Mind.Transform
  zoom: Zoom
}) => {
  const { cacheMap, options, root, container, viewport, transform, zoom } = context
  const process = new Process.Visible()
  const { getRootHeirOrientation } = Helper.transformRootToWalkable(root)
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
