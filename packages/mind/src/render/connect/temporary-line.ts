import Classnames from 'classnames'
import * as D3 from 'd3'

import { withPrefix } from '../../helper/with-prefix'
import { Mind } from '../../index'
import { getPathRender } from './get-path-render'
import { PathClassName, SvgClassName } from './index'

export class TemporaryLine {
  private svg: D3.Selection<D3.BaseType, unknown, null, undefined>
  private g: D3.Selection<D3.BaseType, unknown, null, undefined>
  private path: D3.Selection<D3.BaseType, unknown, null, undefined>
  private cacheMap: Mind.CacheMap
  private options: Required<Mind.Options>

  constructor(
    container: HTMLElement,
    cacheMap: Mind.CacheMap,
    options: Required<Mind.Options>
  ) {
    this.createPathElement(container)
    this.options = options
    this.cacheMap = cacheMap
  }

  public render = (link?: { source: Mind.Coordinate; target: Mind.Coordinate }) => {
    this.path.attr(
      'd',
      link
        ? getPathRender(this.options)({
          cacheMap: this.cacheMap,
          node: {} as any,
          options: this.options,
          source: link.source,
          target: link.target
        })
        : null
    )
  }

  public destroy = () => {
    this.g.remove()
  }

  private createPathElement = (container: HTMLElement) => {
    this.svg = D3.select(container).select(`.${SvgClassName}`)
    this.g = this.svg.append('g')
    this.path = this.g.append('path')
    this.path.attr('class', Classnames(PathClassName, withPrefix('temporary-line')))

    this.path.attr('fill', 'transparent')
  }
}
