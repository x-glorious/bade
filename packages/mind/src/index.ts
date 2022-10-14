import { WithDefault } from './default'
import { Graphic as GraphicClass } from './graphic'
import { Drag as DragClass } from './graphic/drag'
import { Helper } from './helper'
import { Process as ProcessModule } from './process'
import { DraggableLayout as DraggableLayoutClass } from './process/layout/type'

export namespace Mind {
  type ValueOf<T> = T[keyof T]

  export interface Size {
    width: number
    height: number
  }

  export interface Coordinate {
    x: number
    y: number
  }

  export type CacheMap = Map<string, Mind.NodeCache>

  export const ChildAlignMode = {
    /**
     * 子代对齐模式
     */
    descendantCenter: 'descendant-center',
    /**
     * 直系子代节点中心对齐
     */
    heirCenter: 'heir-center',
    /**
     * 结构化规整模式
     */
    structured: 'structured'
  } as const
  export type ChildAlignMode = ValueOf<typeof ChildAlignMode>

  export interface Root {
    /**
     * 根节点数据
     */
    node: Omit<Node, 'children'>
    /**
     * 正向区域节点
     */
    positive?: Node[]
    /**
     * 负向区域节点
     */
    negative?: Node[]
  }

  export const Orientation = {
    /**
     * 处于正向区域
     */
    negative: 'negative',

    /**
     * 处于负向区域
     */
    positive: 'positive',

    /**
     * 根节点
     */
    root: 'root'
  } as const
  export type Orientation = ValueOf<typeof Orientation>

  export const Direction = {
    /**
     * x轴水平方向渲染
     */
    x: 'x',
    /**
     * y轴垂直方向渲染
     */
    y: 'y'
  } as const
  export type Direction = ValueOf<typeof Direction>

  export interface Visible {
    /**
     * 节点本身是否可见
     */
    node: boolean
    /**
     * 与父级之间的连线
     */
    lineAttachParent: boolean
  }

  export interface Transform {
    x: number
    y: number
    scale: number
  }

  export const LinkStyle = {
    /**
     * 贝塞尔曲线
     */
    bezier: 'bezier',
    /**
     * 线性
     * - 线性只有在 ChildAlignMode.structured 风格下表现最佳
     */
    line: 'line'
  } as const
  export type LinkStyle = ValueOf<typeof LinkStyle>

  export interface PathData extends Line {
    /**
     * 节点自身数据
     */
    node: Mind.Node
  }

  export interface Range<T> {
    min: T
    max: T
  }

  export interface PathRenderContext extends PathData {
    /**
     * 设定
     */
    options: Required<Options>
    /**
     * 缓存地图
     */
    cacheMap: CacheMap
  }

  /**
   * 拖动关联信息
   */
  export interface DragAttach {
    /**
     * 链接
     */
    link: {
      source: Mind.Coordinate
      target: Mind.Coordinate
    }
    /**
     * 关联节点
     */
    node: Mind.Node
    /**
     * 拖动节点关联到目标节点的区域
     */
    orientation: Mind.Orientation
  }

  export interface NodeCache {
    /**
     * 节点方位
     */
    orientation: Orientation
    /**
     * 节点数据
     */
    node: Node
    /**
     * 节点所属矩形大小以及位置
     */
    rect: Size & Coordinate
    /**
     * 是否可见
     */
    visible: Visible
    /**
     * 父级节点
     */
    parent?: Node
    /**
     * 处理器在处理时的缓存数据
     */
    processCache: any
    /**
     * 连线相关信息
     */
    line: Line
    /**
     * 整体布局尺寸
     * - 只有根节点保存此数据
     */
    layoutSize?: Size
  }

  export interface Event {
    /**
     * 视窗上下文菜单事件
     * - 组件禁用了在视窗上的右键菜单
     * @param e
     */
    onViewportContextMenu?: (e: MouseEvent) => void
    /**
     * zoom 事件触发器
     */
    onZoomEventTrigger?: ZoomEvent
  }

  export interface Callback {
    /**
     * 转换发生改变，通知外部
     * @param transform
     */
    onTransformChange?: (transform: Transform) => void
    /**
     * 可见节点发生了改变
     * - 每一次 `setData` 后都必定会调用此事件
     * @param nodes 可见节点数组(节点都是对`setData`中节点数据的引用，请注意根节点设置`children`无效)
     */
    onNodeVisibleChange?: (nodes: Mind.Node[]) => void
  }

  export interface Line {
    /**
     * 链接线起点（节点父级）
     */
    source: Coordinate
    /**
     * 连接线终点（节点自身）
     */
    target: Coordinate
  }

  export interface Node {
    /**
     * 全局唯一 id
     */
    id: string
    /**
     * 子代
     */
    children?: Node[]
    /**
     * 是否折叠子代
     * - 根节点为数组，[negative,positive]
     * - 普通节点直接代表是否折叠子代
     * @default false | [false,false]
     */
    fold?: boolean | boolean[]
    /**
     * 附带数据
     * - 请将节点附带的数据全部存储到此处
     */
    attachData?: any
    /**
     * 获取当前节点尺寸
     */
    sizeof: () => Size
  }

  export type PathRender = (context: PathRenderContext) => string

  export const RelativeX = {
    left: 'left',
    middle: 'middle',
    right: 'right'
  } as const
  export type RelativeX = ValueOf<typeof RelativeX>

  export const RelativeY = {
    bottom: 'bottom',
    middle: 'middle',
    top: 'top'
  } as const
  export type RelativeY = ValueOf<typeof RelativeY>

  export interface Relative {
    x: RelativeX
    y: RelativeY
  }

  export interface ZoomExtent {
    /**
     * 位移边界
     * - 其是可视区域（viewport）在图形所在世界的边界坐标
     * - 计算时，可以简单的将 viewport 视作可移动的部分，图形保持位置不变（注意scale带来的影响，需要将viewport转换到图形所在世界坐标系,EM: viewport.width/scale)）
     * @default [[x: -∞, y: -∞], [x: +∞, y :+∞]]
     */
    translate?: [Coordinate, Coordinate]
    /**
     * 缩放边界
     * @default [0, ∞]
     */
    scale?: [number, number]
  }

  export interface Options {
    /**
     * 禁止连接线裁剪渲染
     * @default false
     */
    disableLinesTailor?: boolean
    /**
     * 渲染方向
     * - positive 在 x 模式下渲染在右侧，y 模式下渲染在上侧
     * - negative 在 x 模式下渲染在左侧，y 模式下渲染在下侧
     * @default 'x' 水平方向
     */
    direction?: Direction
    /**
     * 节点间距
     * @default 50
     */
    nodeSeparate?: number
    /**
     * 每一级的距离
     * @default 50
     */
    rankSeparate?: number
    /**
     * 子代对齐模式(布局模式)
     * @default 'structured'
     */
    childAlignMode?: ChildAlignMode
    /**
     * 视窗四周预加载尺寸
     * @default 0
     */
    viewportPreloadPadding?: number
    /**
     * 回调
     */
    callback?: Callback
    /**
     * 事件
     */
    event?: Event
    /**
     * 连线样式风格
     * @default 'bezier'
     */
    lineStyle?: LinkStyle
    /**
     * 自定义path渲染路径
     * - 优先级高于 `lineStyle`
     * @param data
     * @return 返回字符串将作为 path d 属性
     */
    pathRender?: PathRender | undefined
    /**
     * 自定义布局处理器
     * - 优先级高于 childAlignMode 选择的布局方式
     */
    layoutProcess?: { new (): Process.Lifecycle }
    /**
     * 缩放尺度控制
     */
    zoomExtent?: ZoomExtent
    /**
     * 通过此选项自定义拖动 & 缩放的按钮
     * 例如：默认的定义 (event) => {
     * // 修改默认，手势
     * // 右键移动，ctrl+滚轮 缩放
     * return event.button === 2 || (event.ctrlKey && event.type === 'wheel')
    }
     * 
     */
    controlFilter?: (evnet) => boolean
  }

  /**
   * 位移/缩放事件函数
   * @param event the underlying input event, such as mousemove or touchmove
   */
  export type ZoomEventFunc = (event: any) => void

  export interface ZoomEvent {
    /**
     * 缩放/拖动开始事件
     */
    start?: ZoomEventFunc
    /**
     * 缩放/拖动中事件
     */
    zoom?: ZoomEventFunc
    /**
     * 缩放/拖动结束
     */
    end?: ZoomEventFunc
  }

  export namespace Process {
    export type Lifecycle = ProcessModule.Lifecycle
    export type StartContext = ProcessModule.StartContext
    export type EveryContext = ProcessModule.EveryContext
  }

  export type Graphic = GraphicClass
  export const Graphic = GraphicClass

  export type Drag = DragClass
  export const Drag = DragClass

  export type DraggableLayout = DraggableLayoutClass
  export const DraggableLayout = DraggableLayoutClass

  export const _Helper = Helper

  export const _Process = ProcessModule

  export const _WithDefault = WithDefault
}
