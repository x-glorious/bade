import * as D3 from 'd3'

import { Helper } from '../helper'
import { Mind } from '../index'

export class Zoom {
  private viewport: HTMLElement
  private controller = D3.zoom()
  private callback?: (transform: Mind.Transform) => void
  private event?: Mind.ZoomEvent

  constructor(viewport: HTMLElement) {
    this.viewport = viewport
    this.controller.filter((event) => {
      // 修改默认，手势
      // 右键移动，ctrl+滚轮 缩放
      return event.button === 2 || (event.ctrlKey && event.type === 'wheel')
    })
  }

  public bind = (callback: (transform: Mind.Transform) => void, event: Mind.ZoomEvent) => {
    const { start, zoom, end } = event
    this.callback = callback
    this.event = event

    D3.select(this.viewport)
      .call(
        this.controller
          .on('zoom', (e) => {
            const transform: Mind.Transform = {
              scale: e.transform.k,
              x: e.transform.x,
              y: e.transform.y
            }
            callback(transform)
            zoom && zoom(e.sourceEvent)
          })
          .on('start', (e) => start && start(e.sourceEvent))
          .on('end', (e) => end && end(e.sourceEvent))
      )
      .call(this.controller.transform, D3.zoomIdentity)
  }

  public syncZoomExtent = (size: Mind.Size) => {
    this.controller.extent([
      [0, 0],
      [size.width, size.height]
    ])
  }

  public syncZoomExtentOptions = (context: { options: Required<Mind.Options> }) => {
    const {
      options: { zoomExtent }
    } = context

    if (zoomExtent.translate) {
      this.controller.translateExtent(zoomExtent.translate.map((item) => [item.x, item.y]) as any)
    } else {
      this.controller.translateExtent([
        [-Infinity, -Infinity],
        [Infinity, Infinity]
      ])
    }

    if (zoomExtent.scale) {
      this.controller.scaleExtent(zoomExtent.scale)
    } else {
      this.controller.scaleExtent([0.5, 2])
    }
  }

  public scale = (scale: number, point?: Mind.Coordinate, duration = 0) => {
    Helper.mircoTask(() => {
      if (duration) {
        D3.select(this.viewport)
          .transition()
          .duration(duration)
          .call(this.controller.scaleTo, scale, point && [point.x, point.y])
      } else {
        D3.select(this.viewport).call(this.controller.scaleTo, scale, point && [point.x, point.y])
      }
    })
  }

  public translate = (translate: Mind.Coordinate, duration = 0) => {
    Helper.mircoTask(() => {
      if (duration) {
        D3.select(this.viewport)
          .transition()
          .duration(duration)
          .call(this.controller.translateBy, translate.x, translate.y)
      } else {
        D3.select(this.viewport).call(this.controller.translateBy, translate.x, translate.y)
      }
    })
  }

  public setTransform = (transform: Mind.Transform, duration = 0) => {
    // 添加进入微任务队列，避免影响主计算流程
    Helper.mircoTask(() => {
      if (duration) {
        D3.select(this.viewport)
          .transition()
          .duration(duration)
          .call(
            this.controller.transform,
            new D3.ZoomTransform(transform.scale, transform.x, transform.y)
          )
      } else {
        D3.select(this.viewport).call(
          this.controller.transform,
          new D3.ZoomTransform(transform.scale, transform.x, transform.y)
        )
      }
    })
  }

  public destroy = () => {
    D3.select(this.viewport).on('.zoom', null).on('.start', null).on('.end', null)
  }
}
