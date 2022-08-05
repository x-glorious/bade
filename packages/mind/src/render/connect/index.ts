import * as D3 from 'd3'

import { Helper } from '../../helper'
import { Mind } from '../../index'
import { getPathRender } from './get-path-render'
import { line } from './line'

export const SvgClassName = Helper.withPrefix('lines')
export const GroupClassName = Helper.withPrefix('group')
export const PathClassName = Helper.withPrefix('line')

export const connect = (context: {
  cacheMap: Mind.CacheMap
  options: Required<Mind.Options>
  root: Mind.Root
  container: HTMLElement
}) => {
  const { cacheMap, options, root, container } = context
  const rootCache = cacheMap.get(root.node.id)!

  const data: Mind.PathData[] = Array.from(cacheMap.values())
    .filter(
      (cache) =>
        (cache.visible.lineAttachParent || options.disableLinesTailor) &&
        cache.node.id !== root.node.id
    )
    .map((cache) => ({
      node: cache.node,
      source: cache.line.source,
      target: cache.line.target
    }))

  const containerSelector = D3.select(container)
  // 初始化内容
  if (containerSelector.selectChild(`svg.${SvgClassName}`).empty()) {
    containerSelector
      .append('svg')
      .attr('class', SvgClassName)
      .append('g')
      .attr('class', GroupClassName)
  }

  containerSelector
    .selectChild(`svg.${SvgClassName}`)
    .attr('viewBox', [0, 0, rootCache.layoutSize!.width, rootCache.layoutSize!.height])
    .style('width', rootCache.layoutSize!.width)
    .style('height', rootCache.layoutSize!.height)
    .style('overflow', 'visible')
    .style('position', 'relative')
    .style('pointer-events', 'none')
    .selectChild(`g.${GroupClassName}`)
    .selectAll('path')
    .data(data, (d: Mind.PathData) => d.node.id)
    .join('path')
    .attr('id', (d: Mind.PathData) => Helper.getSvgPathId(d.node.id))
    .attr('d', (d: Mind.PathData) => {
      const context: Mind.PathRenderContext = {
        ...d,
        cacheMap,
        options
      }
      return getPathRender(options)(context)
    })
    .attr('class', PathClassName)
    .attr('fill', 'transparent')
}
