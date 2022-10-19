import * as D3 from 'd3'
import { merge, throttle } from 'lodash'

import { WithDefault } from '../default'
import { Helper } from '../helper'
import { Mind } from '../index'
import { Render } from '../render'
import { Drag } from './drag'
import { nodeTranslateTo } from './node-translate-to'
import { Zoom } from './zoom'

export class Graphic {
  /**
   * 节点相关信息缓存，树形结构拍平
   */
  private cacheMap: Mind.CacheMap = new Map()
  private options: Required<Mind.Options>
  private readonly container: HTMLElement
  private readonly viewport: HTMLElement
  private transform: Mind.Transform = WithDefault.transform()
  private root?: Mind.Root
  private anchor?: string
  private resizeObserver: ResizeObserver
  private unbindCache: (() => void)[] = []
  private readonly zoom: Zoom

  /**
   * 脑图管理器
   * - `viewport`用作判断可视区域
   * - svg连线将会自动注入到`container`中
   * - transform 相关信息将会自动注入到`container`中
   * @param viewport 视窗
   * @param container 容器
   * @param options 配置参数
   */
  constructor(viewport: HTMLElement, container: HTMLElement, options?: Mind.Options) {
    this.viewport = viewport
    this.container = container
    this.options = WithDefault.options(options)
    this.zoom = new Zoom(viewport)
    this.syncZoomExtentOptions()
    this.bindEventListener()
  }

  /**
   * 同步 options 中的 zoom extent
   */
  private syncZoomExtentOptions = () => {
    this.zoom.syncZoomExtentOptions({ options: this.options })
  }
  /**
   * 获取当前可见的节点
   */
  private getVisibleNodes = () => {
    const nodes: Mind.Node[] = []

    for (const cache of Array.from(this.cacheMap.values())) {
      if (cache.visible.node) {
        // cache 中根节点 node 是源数据的 copy，故而需要特殊处理
        if (this.root && cache.node.id === this.root.node.id) {
          nodes.push(this.root.node)
        } else {
          nodes.push(cache.node)
        }
      }
    }
    return nodes
  }

  /**
   * 获取节点定位锚点（左上角）位置，可在节点绘制的时候确定其位置
   * - 推荐所有节点使用`position:absolute;left:0;top:0;`并且配合`transform`来定位，避免出现绘制异常
   * @param id 节点对应id
   */
  public getNodeAnchorCoordinate = (id: string): Mind.Coordinate | undefined => {
    const cache = this.cacheMap.get(id)

    if (!cache) {
      return undefined
    } else {
      return {
        x: cache.rect.x - cache.rect.width / 2,
        y: cache.rect.y - cache.rect.height / 2
      }
    }
  }

  // 绑定监听事件
  private bindEventListener = () => {
    // 注销之前的事件绑定
    this.unbind()
    // 上下文菜单触发事件
    const onContextMenu = (e: MouseEvent) => {
      this.options.event!.onViewportContextMenu!(e)
      // 禁止弹出默认菜单
      e.preventDefault()
    }
    // 视窗右键菜单操作
    this.viewport.addEventListener('contextmenu', onContextMenu)
    this.unbindCache.push(() => {
      this.viewport.removeEventListener('contextmenu', onContextMenu)
    })

    // 绑定 zoom 监听
    // 此处再次封装 event 是为了在 onZoomEventTrigger 内容改变的时候，依旧可以正确触发事件
    this.zoom.bind(this.onTransform, {
      end: (e) => this.options.event.onZoomEventTrigger!.end!(e),
      start: (e) => this.options.event.onZoomEventTrigger!.start!(e),
      zoom: (e) => this.options.event.onZoomEventTrigger!.zoom!(e)
    })
    this.unbindCache.push(this.zoom.destroy)

    // 绑定尺寸改变监听事件
    if (ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.onViewportResize)
      this.resizeObserver.observe(this.viewport)
      this.unbindCache.push(() => this.resizeObserver.unobserve(this.viewport))
    }
  }

  private onTransform = (transform: Mind.Transform) => {
    this.transform = transform
    // 直接修改 dom style
    this.container.style.transform = `translateX(${transform.x}px) translateY(${transform.y}px) scale(${transform.scale})`
    this.container.style.transformOrigin = 'left top'

    // 刷新可视区域
    this.refreshVisible()
    // 回调事件，通知外部 transform 改变
    this.options.callback.onTransformChange!(transform)
  }
  /**
   * - 计算节点可见是否改变，如改变，则通知外部
   * - 重渲染连线，销毁不必要的连线
   */
  private refreshVisible = () => {
    if (this.cacheMap.size) {
      const visibleChange = this.calcVisible()
      // 节点可见性改变，通知外部重新渲染
      if (visibleChange.node) {
        this.options.callback.onNodeVisibleChange!(this.getVisibleNodes())
      }
      // 连线可见性出现改变，则重新绘制线条
      if (visibleChange.lineAttachParent) {
        this.connect()
      }
    }
  }

  private throttleRefreshVisible = throttle(this.refreshVisible, 100)
  /**
   * 视窗尺寸变化
   * @private
   */
  private onViewportResize = () => {
    this.zoom.syncZoomExtent({
      height: this.viewport.clientHeight,
      width: this.viewport.clientWidth
    })
    // 避免频繁的刷新可视区域导致界面卡顿
    this.throttleRefreshVisible()
  }

  /**
   * 注销事件绑定
   * - 请在销毁组件之前调用
   */
  public unbind = () => {
    this.unbindCache.forEach((dispose) => dispose())
    this.unbindCache = []
  }

  /**
   * 判断节点是否可视
   * @param id 节点对应id
   */
  public judgeNodeVisible = (id: string) => {
    const cache = this.cacheMap.get(id)

    if (cache) {
      return cache.visible.node
    } else {
      return false
    }
  }

  /**
   * 设定 `options`
   * - 函数不会自动执行重渲染，如果改变的`options`需要重新计算布局等操作，推荐使用 `setData` 驱动数据重渲染
   * @param options 设定选项
   * @param isMerge 是否与之前的`options`做合并操作
   */
  public setOptions = (options?: Mind.Options, isMerge = false) => {
    if (isMerge) {
      this.options = merge({}, this.options, options || {})
    } else {
      this.options = WithDefault.options(options)
    }

    this.syncZoomExtentOptions()
  }

  /**
   * 生成拖动控制器
   * - 根节点不可拖拽
   * - 当前暂时只有`Mind.ChildAlignMode.structured`布局算法支持拖拽功能
   * @param drag 拖动节点node对象或id
   * @return
   * - 当root（没有调用`setData`）不存在时，或者`drag`为根节点时，返回`undefined`
   * - 正常情况返回 `Drag` 类对象
   */
  public dragControllerBuilder = (drag: Mind.Node | string) => {
    const dragNode = typeof drag === 'string' ? this.cacheMap.get(drag)?.node : drag

    if (this.root && dragNode && dragNode.id !== this.root.node.id) {
      return new Drag({
        cacheMap: this.cacheMap,
        container: this.container,
        dragNode,
        options: this.options,
        root: this.root
      })
    } else {
      return undefined
    }
  }

  /**
   * 获取渲染层尺寸
   */
  public getLayoutSize = (): Mind.Size | undefined => {
    const root = this.cacheMap.get(this.root?.node?.id || '')
    if (root) {
      return root.layoutSize
    } else {
      return undefined
    }
  }

  /**
   * 获取`id`对应节点
   * @param id 节点`id`
   */
  public getNode = (id: string): Mind.Node | undefined => this.cacheMap.get(id)?.node

  /**
   * 获取`id`对应节点父级
   * @param id 节点`id`
   */
  public getParent = (id: string): Mind.Node | undefined => this.cacheMap.get(id)?.parent

  /**
   * 获取`id`对应节点渲染方位
   * @param id 节点`id`
   */
  public getNodeOrientation = (id: string): Mind.Orientation | undefined =>
    this.cacheMap.get(id)?.orientation

  /**
   * 主动设置位移缩放
   * - 会与之前的`transform`做深度合并
   * - 请注意：`setTransform` 之后 `onTransformChange` 事件依旧会触发
   * - 此方法不受 `zoomExtent.translate`、`zoomExtent.scale` 限制
   * @param transform 位移缩放数据
   * @param duration 周期，如果配置，则执行变换会附带动画效果
   */
  public setTransform = (transform: Partial<Mind.Transform>, duration?: number) => {
    this.transform = merge({}, this.transform, transform)
    this.zoom.setTransform(this.transform, duration)
  }

  /**
   * 设定位移
   * - 此方法受到 `zoomExtent.translate` 限制
   * @param translate 位移差(屏幕尺度)
   * @param duration 周期，如果配置，则执行变换会附带动画效果
   */
  public translate = (translate: Mind.Coordinate, duration?: number) => {
    this.zoom.translate(translate, duration)
  }

  /**
   * 设定缩放
   * - 此方法受到 `zoomExtent.translate` 限制
   * - 此方法受到 `zoomExtent.scale` 限制
   * @param scale 缩放比
   * @param point 缩放相对点（如不配置或为`undefined`，则默认相对于`viewport`中心缩放）
   * @param duration 动画周期，如配置，则位移会附带动画效果
   */
  public scale = (scale: number, point?: Mind.Coordinate, duration?: number) => {
    this.zoom.scale(scale, point, duration)
  }

  /**
   * 将某一个节点中心从某个相对位置做位移（其尺度为屏幕尺度）操作
   * - 此方法不受 `zoomExtent.translate` 限制
   * @param config 配置参数
   * @param config.id 节点id
   * @param config.diff 位移差
   * @param config.relative 相对位置
   * @param duration 动画周期，如配置，则位移会附带动画效果
   */
  public nodeTranslateTo = (
    config: {
      id: string
      diff: Mind.Coordinate
      relative: Mind.Relative
    },
    duration?: number
  ) => {
    const { id, diff, relative } = config
    nodeTranslateTo(
      {
        cacheMap: this.cacheMap,
        diff,
        id,
        relative,
        transform: this.transform,
        viewport: this.viewport,
        zoom: this.zoom
      },
      duration
    )
  }

  /**
   * 获取位移缩放信息
   */
  public getTransform = (): Mind.Transform => ({ ...this.transform })

  /**
   * 设置锚点节点
   * @param id 锚定节点id(如不设定，则清空锚点，根节点居中，缩放比归一)
   */
  public setAnchor = (id?: string) => {
    this.anchor = id
  }
  /**
   * 设置/更新数据，启动重渲染
   * - 在重计算定位时，将保持 `anchor` 对应节点在屏幕上的相对位置不变
   * - 如果 `anchor` 没有设定，或者找不到对应节点，则，根节点居中，缩放比重置为1
   * @param root 根数据
   */
  public setData = (root: Mind.Root) => {
    this.root = root
    // 计算布局，定位锚点
    this.layout()
    // 计算可见范围
    this.calcVisible()
    // 连线
    this.connect()
    // 同步层级尺寸
    this.syncLayoutSize()
    // 设定数据后，通知外部可见节点
    this.options.callback.onNodeVisibleChange!(this.getVisibleNodes())
  }

  /**
   * 刷新
   */
  public refresh = () => {
    if (this.root) {
      this.setData(this.root)
    }
  }

  /**
   * 渲染链接到某个`container`下
   * @param container 容器
   */
  public connectTo = (container: HTMLElement) => {
    Render.connect({
      cacheMap: this.cacheMap,
      container,
      options: this.options,
      root: this.root!
    })
  }

  /**
   * 同步渲染层尺寸到 container 中
   */
  private syncLayoutSize = () => {
    const layoutSize = this.cacheMap.get(this.root?.node.id || '')?.layoutSize || {
      height: 0,
      width: 0
    }
    this.container.style.width = `${layoutSize.width}px`
    this.container.style.height = `${layoutSize.height}px`
  }
  /**
   * 链接各个节点
   */
  private connect = () => {
    this.connectTo(this.container)
  }
  /**
   * 计算脑图布局
   * - 请保证调用之前 data 已经通过 setData 设置完备
   */
  private layout = () => {
    Render.layout({
      anchor: this.anchor,
      cacheMap: this.cacheMap,
      container: this.container,
      options: this.options,
      root: this.root!,
      transform: this.transform,
      viewport: this.viewport,
      zoom: this.zoom
    })
  }

  /**
   * 计算各节点可见性，以及链接可见性
   */
  private calcVisible = () => {
    return Render.calcVisible({
      cacheMap: this.cacheMap,
      container: this.container,
      options: this.options,
      root: this.root!,
      transform: this.transform,
      viewport: this.viewport,
      zoom: this.zoom
    })
  }
}
