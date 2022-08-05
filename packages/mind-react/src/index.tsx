import React from 'react'

import { Mind } from 'bade-mind'

import { View as _View } from './component'

export namespace MindReact {
  export const View = _View

  export interface GraphicRef {
    mind?: Mind.Graphic
  }

  export interface Node extends Omit<Mind.Node, 'sizeof' | 'children'> {
    /**
     * 当设置 size 时，将会禁止自动测量，提升速率
     */
    size?: Mind.Size
    /**
     * 节点是否受到保护（超出可视区域不会被销毁，但会设置`visible=hidden`）
     * @default false
     */
    beProtected?: boolean
    /**
     * 节点总是可见（超出可视区域不会被销毁也不会改变`visible`状态）
     * @default false
     */
    alwaysVisible?: boolean
    /**
     * 禁用尺寸缓存
     * @default false
     */
    disableSizeCache?: boolean
    /**
     * 子代节点
     */
    children?: Node[]
    /**
     * 节点是否可拖拽
     * @default false
     */
    draggable?: boolean
    /**
     * 节点是否可被拖拽节点依附作为其子节点
     * @default true
     */
    droppable?: boolean
  }

  export interface Root {
    node: Node
    positive?: Node[]
    negative?: Node[]
  }

  export type Render = (data: Node, mirror: boolean) => React.ReactNode

  export type DragStartEvent = (event: { node: Node }) => void

  /* eslint-disable */
  export type DragEvent = (event: {
    node: Node
    attach:
      | {
          parent: Node
          orientation: Mind.Orientation
        }
      | undefined
    mirrorPosition: Mind.Coordinate
  }) => void

  export type DragEndEvent = (event: {
    node: Node
    attach:
      | {
          parent: Node
          orientation: Mind.Orientation
          index: number
        }
      | undefined
    original: {
      parent: Node
      orientation: Mind.Orientation
    }
  }) => void

  export interface ViewProps {
    /**
     * bade mind 配置项
     * - 做浅比较，引用出现改变则重新绘制
     */
    options?: Mind.Options
    /**
     * 脑图结构数据
     * - 做浅比较，引用出现改变则重新绘制
     * - html 值将由组件自动注入到对象中（不改变对象引用，只是注入值）
     * - 如果节点**长宽固定值**，则，请直接设置 size，避免性能损耗
     */
    data: Root
    /**
     * 节点渲染器
     * - 做浅比较，引用出现改变则重新绘制
     * - 请在节点**第一次渲染时就确定其尺寸**，当节点尺寸改变时，需要修改`data`引用，唤起重计算
     * - 请保持镜像节点尺寸与源节点尺寸一致
     * @param data 节点数据
     * @param mirror 渲染节点是否为镜像节点（拖拽）
     */
    render: Render
    /**
     * 渲染锚点数据
     * - 在启动重渲染时保持 anchor 对应节点在屏幕上的相对位置不变
     * - 如不设定，则清空锚点，根节点居中，缩放比归一
     */
    anchor?: string
    /**
     * 是否展示滚动条
     * - 当展示滚动条时，将会自动限定位移区域
     * - 当隐藏滚动条时，位移范围无限制
     * @default false
     */
    scrollbar?: boolean
    /**
     * 图形更新完成
     * - 由 data 和 options 改变所引起，脑图控制对象内部状态刷新
     * - 即，此时，脑图所有的状态以及渲染已经完成
     * @param mind 脑图控制对象
     */
    onUpdated?: (mind: Mind.Graphic) => void
    /**
     * 注入到根上的 `class`
     */
    className?: string
    /**
     * 注入到根上的 `style`
     */
    style?: React.CSSProperties
    /**
     * 滚轮移动速度
     * @default 0.5
     */
    wheelMoveSpeed?: number
    /**
     * 拖拽开始事件
     * @param node 拖拽的节点
     */
    onDragStart?: DragStartEvent
    /**
     * 拖拽中事件
     * @param event.node 拖拽的节点
     * @param event.attach 拖拽节点关联的节点（关联父级），可能为空
     * @param event.position 拖拽节点镜像中心当前位置
     * @param event.orientation 拖拽节点当前位于哪个区域（位于根节点区域时为空，此时无法附着在任何一个节点上）
     */
    onDrag?: DragEvent
    /**
     * 拖拽结束事件
     * @param event.node 拖拽的节点
     * @param event.attach 拖拽节点最终关联的节点（关联父级），可能为空
     * @param event.orientation 拖拽节点当前最终位于哪个区域（位于根节点区域时为空，此时无法附着在任何一个节点上）
     * @param event.id 拖拽节点位于最终关联节点子代（关联父级）中的目标位置（-1代表无需改变位置）（需要注意的是，关联的父节点可能仍然是拖动节点自身的父节点）
     */
    onDragEnd?: DragEndEvent
  }
}
