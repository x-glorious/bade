import * as React from 'react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { BadeMind } from 'bade-mind'
import Classnames from 'classnames'

import { useDrag } from '../hook/use-drag'
import { BadeMindReact } from '../index'
import { classNameWrapper } from '../tools/class-name-wrapper'

// @ts-ignore-next-line
import Style from './index.module.scss'

interface NodesProps {
  renderChangeToggle: number
  mind?: BadeMind.Graphic
  data: BadeMindReact.Root
  render: BadeMindReact.Render
  onDragStart?: BadeMindReact.DragStartEvent
  onDrag?: BadeMindReact.DragEvent
  onDragEnd?: BadeMindReact.DragEndEvent
}

interface SizeCache {
  size: BadeMind.Size
  updateToDate: boolean
}
export const Nodes = (props: NodesProps) => {
  const { mind, data, render, renderChangeToggle, onDrag, onDragEnd, onDragStart } = props
  // 尺寸缓存器
  const sizeCacheMap = useRef(new Map<string, SizeCache>())
  // 包裹节点的容器容器引用
  const [nodesContainer, setNodesContainer] = useState<HTMLDivElement | null>(null)

  const renderNodes = useMemo(() => {
    if (data) {
      const preSizeCacheMap = new Map(sizeCacheMap.current)
      sizeCacheMap.current = new Map<string, SizeCache>()

      return BadeMind._Helper.rootToNodeArray(data as BadeMind.Root, (node) => {
        // 缓存中没有，则创建
        if (!preSizeCacheMap.has(node.id)) {
          sizeCacheMap.current.set(node.id, {
            size: { height: -1, width: -1 },
            updateToDate: false
          })
        }
        // updateToDate=false 标识，标识，数据已过期
        else {
          const pre = preSizeCacheMap.get(node.id)!
          pre.updateToDate = false
          sizeCacheMap.current.set(node.id, pre)
        }
      }) as BadeMindReact.Node[]
    }

    return []
  }, [data])

  const getNodeSize = useCallback((id: string) => {
    return sizeCacheMap.current.get(id)?.size
  }, [])

  const { isInDragging, dragNode, dragMirrorPosition, dragAttachedNode } = useDrag({
    data,
    draggableNodeWrapperQualifier: `.${Style['node-wrapper']}[data-node-draggable="true"]:not(.${Style['drag-mirror-node']})`,
    mind,
    nodeWrapperClassName: Style['node-wrapper'],
    nodesContainer,
    onDrag,
    onDragEnd,
    onDragStart,
    renderChangeToggle,
    renderNodes,
    sizeof: getNodeSize
  })

  const nodes = useMemo(() => {
    return renderNodes.map((node) => {
      const position = mind?.getNodeAnchorCoordinate(node.id) || { x: 0, y: 0 }
      const visible = mind?.judgeNodeVisible(node.id) || node.alwaysVisible
      const sizeCache = sizeCacheMap.current.get(node.id)!
      // 当尺寸数据并非最新的时候，一下情况需要更新其数据
      // - 尺寸不存在
      // - 禁用尺寸缓存时
      let needUpdateSize =
        !sizeCache.updateToDate && (sizeCache.size.width < 0 || node.disableSizeCache)
      // node size 优先级最高，外界已测量好尺寸，故而，无需再次测量
      if (node.size) {
        needUpdateSize = false
        sizeCache.size.width = node.size.width
        sizeCache.size.height = node.size.height
      }
      // 当不需要更新尺寸的时候，直接使用缓存
      if (!needUpdateSize) {
        ;(node as BadeMind.Node).sizeof = () => ({
          height: sizeCache.size.height,
          width: sizeCache.size.width
        })
      }
      // - 受保护节点，一直存在
      // - 当节点可见时，需要存在
      // - 当需要刷新size时，节点需要存在
      const exist = visible || node.beProtected || needUpdateSize
      // 根节点不允许拖拽
      const draggable = !!node.draggable && node.id !== data.node.id

      return (
        exist && (
          <div
            key={node.id}
            className={Classnames(classNameWrapper(Style, 'node-wrapper'), {
              [classNameWrapper(Style, 'node-wrapper--dragging')]:
                node.id === dragNode?.id && isInDragging,
              [classNameWrapper(Style, 'node-wrapper--attached')]:
                node.id === dragAttachedNode?.id && isInDragging
            })}
            style={{
              transform: `translateX(${position.x}px) translateY(${position.y}px)`,
              visibility: visible ? 'visible' : 'hidden'
            }}
            data-node-id={String(node.id)}
            data-node-draggable={String(draggable)}
            ref={(element) => {
              if (element && needUpdateSize) {
                ;(node as BadeMind.Node).sizeof = () => {
                  // 标识已经获取了最新数据
                  sizeCache.updateToDate = true
                  sizeCache.size.width = element.clientWidth
                  sizeCache.size.height = element.clientHeight
                  return {
                    height: element.clientHeight,
                    width: element.clientWidth
                  }
                }
              }
            }}
          >
            {render(node, false)}
          </div>
        )
      )
    })
  }, [mind, renderNodes, renderChangeToggle, render, dragNode, dragAttachedNode, isInDragging])

  return (
    <div className={classNameWrapper(Style, 'nodes')} ref={setNodesContainer}>
      {nodes}
      {dragNode && isInDragging && (
        <div
          className={Classnames(
            classNameWrapper(Style, 'node-wrapper'),
            classNameWrapper(Style, 'drag-mirror-node')
          )}
          style={{
            transform: `translateX(${dragMirrorPosition.x}px) translateY(${dragMirrorPosition.y}px)`
          }}
        >
          {render(dragNode, true)}
        </div>
      )}
    </div>
  )
}
