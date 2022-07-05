/* eslint-disable @typescript-eslint/indent */
/* eslint-disable prettier/prettier*/
import { useEffect, useRef, useState } from 'react'

import { BadeMind } from 'bade-mind'
import * as D3 from 'd3'

import { BadeMindReact } from '../index'
import { useShadowState } from './use-shadow-state'

export const useDrag = (context: {
  mind?: BadeMind.Graphic
  draggableNodeWrapperQualifier: string
  nodeWrapperClassName: string
  nodesContainer: HTMLDivElement | null
  onDragStart?: BadeMindReact.DragStartEvent
  onDrag?: BadeMindReact.DragEvent
  onDragEnd?: BadeMindReact.DragEndEvent
  sizeof: (id: string) => BadeMind.Size | undefined
  renderNodes: BadeMindReact.Node[]
  data: BadeMindReact.Root
  renderChangeToggle: number
}) => {
  const {
    mind,
    draggableNodeWrapperQualifier,
    nodeWrapperClassName,
    nodesContainer,
    onDrag,
    onDragEnd,
    onDragStart,
    sizeof,
    renderNodes,
    data,
    renderChangeToggle
  } = context

  // 被拖动的节点
  const [dragNode, setDragNode, dragNodeShadow] = useShadowState<BadeMindReact.Node | undefined>(
    undefined
  )
  // 被拖动节点附着的节点
  const [dragAttachedNode, setDragAttachedNode, dragAttachedNodeShadow] = useShadowState<
    BadeMindReact.Node | undefined
  >(undefined)
  // 拖动操作控制器
  const dragController = useRef<BadeMind.Drag | undefined>(undefined)
  // 拖动镜像节点位置
  const [dragMirrorPosition, setDragMirrorPosition, dragMirrorPositionShadow] =
    useShadowState<BadeMind.Coordinate>({
      x: 0,
      y: 0
    })
  // 当前是否正在拖动
  const [isInDragging, setIsInDragging] = useState(false)
  // 拖动节点镜像节点相关信息
  const dragMirrorInfo = useRef({
    origin: { x: 0, y: 0 },
    size: { height: 0, width: 0 },
    start: { x: 0, y: 0 }
  })
  const dragOrientation = useRef<BadeMind.Orientation | undefined>(undefined)

  useEffect(() => {
    if (mind && nodesContainer) {
      D3.select(nodesContainer)
        .selectAll(draggableNodeWrapperQualifier)
        .call(
          D3.drag()
            .on('start', (e) => {
              const dragElement: HTMLElement = e.sourceEvent.path.find((item) =>
                item.className.includes(nodeWrapperClassName)
              )

              if (dragElement) {
                const dragId = dragElement.getAttribute('data-node-id')!
                const origin = mind.getNodeAnchorCoordinate(dragId)
                const size = sizeof(dragId)

                if (origin) {
                  // 记录开始点
                  dragMirrorInfo.current.start.x = e.x
                  dragMirrorInfo.current.start.y = e.y
                  // 原点（左上角原始位置）
                  dragMirrorInfo.current.origin.x = origin.x
                  dragMirrorInfo.current.origin.y = origin.y
                  setDragMirrorPosition({
                    x: origin.x,
                    y: origin.y
                  })
                }
                if (size) {
                  // 记录拖动节点尺寸
                  dragMirrorInfo.current.size.width = size.width
                  dragMirrorInfo.current.size.height = size.height
                }

                const dragNode = mind.getNode(dragId)
                if (dragNode) {
                  // 调用拖动开始事件
                  onDragStart &&
                    onDragStart({
                      node: dragNode
                    })
                  setDragNode(dragNode as BadeMindReact.Node)
                  dragController.current = mind.dragControllerBuilder(dragId)
                }
              }
            })
            .on('drag', (e) => {
              if (dragController.current) {
                const scale = mind.getTransform().scale
                const diff: BadeMind.Coordinate = {
                  x: (e.x - dragMirrorInfo.current.start.x) / scale,
                  y: (e.y - dragMirrorInfo.current.start.y) / scale
                }
                const mirrorCenter: BadeMind.Coordinate = {
                  x:
                    diff.x +
                    dragMirrorInfo.current.origin.x +
                    dragMirrorInfo.current.size.width / 2,
                  y:
                    diff.y +
                    dragMirrorInfo.current.origin.y +
                    dragMirrorInfo.current.size.height / 2
                }
                setDragMirrorPosition({
                  x: diff.x + dragMirrorInfo.current.origin.x,
                  y: diff.y + dragMirrorInfo.current.origin.y
                })
                const target = dragController.current.drag(
                  {
                    ...mirrorCenter
                  },
                  renderNodes.filter(node => node.droppable === undefined ? true : node.droppable) as BadeMind.Node[]
                )
                dragOrientation.current = target?.orientation
                // 调用拖动中事件
                onDrag &&
                  onDrag({
                    attach:
                      target && target.attach && target.orientation
                        ? {
                          orientation: target.orientation,
                          parent: target.attach
                        }
                        : undefined,
                    mirrorPosition: { ...mirrorCenter },
                    node: dragNodeShadow.current!
                  })
                setIsInDragging(true)
                setDragAttachedNode(target?.attach)
              }
            })
            .on('end', () => {
              // 通知控制器已经结束拖动
              if (dragController.current) {
                const attachNode = dragAttachedNodeShadow.current
                let index = -1
                if (attachNode) {
                  let children = attachNode.children
                  // 根节点
                  if (attachNode.id === data.node.id) {
                    children =
                      dragOrientation.current === BadeMind.Orientation.positive
                        ? data.positive
                        : data.negative
                  }
                  index = dragController.current.calcDropIndex(
                    children as BadeMind.Node[],
                    {
                      x: dragMirrorPositionShadow.current.x + dragMirrorInfo.current.size.width / 2,
                      y: dragMirrorPositionShadow.current.y + dragMirrorInfo.current.size.height / 2
                    },
                    dragNodeShadow.current! as BadeMind.Node,
                    attachNode as BadeMind.Node
                  )
                }

                dragController.current.end()
                dragController.current = undefined
                
                // 调用拖动结束事件
                onDragEnd &&
                  onDragEnd({
                    attach: dragAttachedNodeShadow.current && dragOrientation.current ? {
                      index,
                      orientation: dragOrientation.current,
                      parent: dragAttachedNodeShadow.current
                    } : undefined,
                    node: dragNodeShadow.current!,
                    original:{
                      orientation: mind.getNodeOrientation(dragNodeShadow.current!.id)!,
                      parent: mind.getParent(dragNodeShadow.current!.id)!
                    },
                  })
              }
              // 清空数据
              setDragNode(undefined)
              setDragAttachedNode(undefined)
              setIsInDragging(false)
              dragOrientation.current = undefined
            })
        )
    }
  }, [mind, renderChangeToggle, data, renderNodes, onDragStart, onDrag, onDragEnd, nodesContainer])

  return {
    dragAttachedNode,
    dragMirrorPosition,
    dragNode,
    isInDragging
  }
}
