import { Helper } from '../helper'
import { Mind } from '../index'
import { Process } from '../process'
import { DraggableLayout } from '../process/layout/type'
import { TemporaryLine } from '../render/connect/temporary-line'

export class Drag {
  private readonly options: Required<Mind.Options>
  private readonly cacheMap: Mind.CacheMap
  private readonly root: Mind.Root
  private readonly dragNode: Mind.Node
  private readonly ignoreNodes: Mind.Node[]
  private temporaryLine: TemporaryLine
  private readonly container: HTMLElement
  private readonly draggableLayout: typeof DraggableLayout

  constructor(context: {
    options: Required<Mind.Options>
    cacheMap: Mind.CacheMap
    root: Mind.Root
    dragNode: Mind.Node
    container: HTMLElement
  }) {
    const { options, root, dragNode, cacheMap, container } = context
    this.options = options
    this.root = root
    this.dragNode = dragNode
    this.cacheMap = cacheMap
    this.container = container
    this.draggableLayout = Process.getLayoutProcess(options) as any
    // 检查当前使用的算法是否支持拖拽操作，如不支持，则报错
    if (!DraggableLayout.isValidExtendsClass(this.draggableLayout)) {
      if (options.layoutProcess) {
        throw Helper.error(
          `The custom layoutProcess is not support drag action, it should extends DraggableLayout`
        )
      } else {
        throw Helper.error(
          `The childAlignMode="${options.childAlignMode}" match layout process ${this.draggableLayout.name} is not support drag action`
        )
      }
    }
    // 当前节点以及其后代，全部忽略计算
    this.ignoreNodes = [this.dragNode, ...Helper.descendant(this.dragNode)]
    // 创建临时线
    this.temporaryLine = new TemporaryLine(this.container, this.cacheMap, this.options)
  }

  /**
   * 获取拖动节点插入到关联节点子代的下标
   * @param attachedNodeChildren 关联节点的子代
   * @param dropPosition 拖动节点镜像中心位置
   * @param dragNode 拖动节点
   * @param attachedNode 被关联的节点
   * @return 期望插入位置
   */
  public calcDropIndex = (
    attachedNodeChildren: Mind.Node[] | undefined,
    dropPosition: Mind.Coordinate,
    dragNode: Mind.Node,
    attachedNode: Mind.Node
  ) => {
    return this.draggableLayout.calcDropIndex({
      attachedNode,
      attachedNodeChildren,
      cacheMap: this.cacheMap,
      dragNode,
      dropPosition,
      options: this.options,
      root: this.root
    })
  }
  /**
   * 拖动操作
   * - 根节点不可拖拽
   * @param position 拖动节点镜像中心位置
   * @param canBeAttachedNodes 需要搜索的可关联节点
   * @return 链接关联信息
   */
  public drag = (position: Mind.Coordinate, canBeAttachedNodes: Mind.Node[]) => {
    const cache = this.cacheMap.get(this.dragNode.id)

    // 根节点不可拖拽
    if (!cache || cache.node.id === this.root.node.id) {
      return undefined
    }

    const dragAttach = this.draggableLayout.calcDragAttach({
      cacheMap: this.cacheMap,
      canBeAttachedNodes,
      draggingRect: {
        ...position,
        height: cache.rect.height,
        width: cache.rect.width
      },
      ignoreNodes: this.ignoreNodes,
      options: this.options,
      root: this.root
    })

    // 数据成功获取
    if (dragAttach) {
      this.temporaryLine.render({
        source: dragAttach.link.source,
        target: dragAttach.link.target
      })

      return {
        attach: dragAttach.node,
        orientation: dragAttach.orientation
      }
    } else {
      this.temporaryLine.render()
      return undefined
    }
  }

  /**
   * 通知控制器拖动操作结束
   */
  public end = () => {
    this.temporaryLine.destroy()
  }
}
