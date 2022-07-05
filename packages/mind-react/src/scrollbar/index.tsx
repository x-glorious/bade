import React, { useCallback, useEffect, useState } from 'react'

import { BadeMind } from 'bade-mind'

import { Axis } from './axis'

interface Range {
  min: number
  max: number
}

export const Scrollbar = (props: {
  viewport?: HTMLElement | null
  container?: HTMLElement | null
  mind?: BadeMind.Graphic | undefined
  transform?: BadeMind.Transform | undefined
  options: BadeMind.Options
}) => {
  const { viewport, container, mind, transform, options } = props
  const [boundary, setBoundary] = useState<{
    x: Range
    y: Range
  }>({
    x: {
      max: 0,
      min: 0
    },
    y: {
      max: 0,
      min: 0
    }
  })
  const [viewportSize, setViewportSize] = useState<BadeMind.Size>({
    height: 0,
    width: 0
  })
  const [containerSize, setContainerSize] = useState<BadeMind.Size>({
    height: 0,
    width: 0
  })

  // 监听视窗和容器尺寸改变
  useEffect(() => {
    if (viewport && container) {
      const observer = new ResizeObserver(() => {
        setViewportSize({
          height: viewport.clientHeight,
          width: viewport.clientWidth
        })
        setContainerSize({
          height: container.clientHeight,
          width: container.clientWidth
        })
      })
      observer.observe(viewport)
      observer.observe(container)

      return () => {
        observer.unobserve(viewport)
        observer.unobserve(container)
      }
    }
  }, [viewport, container])

  useEffect(
    () => {
      if (containerSize.width && viewportSize.width && transform && mind) {
        // 设定位移边界
        mind.setOptions(
          {
            zoomExtent: {
              translate: [
                {
                  x: -viewportSize.width / transform.scale,
                  y: -viewportSize.height / transform.scale
                },
                {
                  x: containerSize.width + viewportSize.width / transform.scale,
                  y: containerSize.height + viewportSize.height / transform.scale
                }
              ]
            }
          },
          true
        )

        // 设定边界
        setBoundary({
          x: {
            max: viewportSize.width,
            min: -containerSize.width * transform.scale
          },
          y: {
            max: viewportSize.height,
            min: -containerSize.height * transform.scale
          }
        })
      }
    },
    // 当 options 改变时，需要为mind重新设定 zoom 界限
    [containerSize, viewportSize, options, transform, mind]
  )

  // 没有初始化完成之前不展示滚动条
  if (
    !viewport ||
    !container ||
    !mind ||
    !transform ||
    !containerSize.width ||
    !viewportSize.width
  ) {
    return <React.Fragment />
  }

  return (
    <React.Fragment>
      <Axis
        total={boundary.x.max - boundary.x.min}
        thumb={viewportSize.width}
        value={boundary.x.max - transform.x}
        onChange={(percentage) => {
          if (mind) {
            mind.setTransform({
              ...mind.getTransform(),
              x: boundary.x.max - (boundary.x.max - boundary.x.min) * percentage
            })
          }
        }}
        vertical={false}
      />
      <Axis
        total={boundary.y.max - boundary.y.min}
        thumb={viewportSize.height}
        value={boundary.y.max - transform.y}
        onChange={(percentage) => {
          if (mind) {
            mind.setTransform({
              ...mind.getTransform(),
              y: boundary.y.max - (boundary.y.max - boundary.y.min) * percentage
            })
          }
        }}
        vertical={true}
      />
    </React.Fragment>
  )
}
