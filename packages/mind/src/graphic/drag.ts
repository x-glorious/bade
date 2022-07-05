import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Process } from '../process'
import { DraggableLayout } from '../process/layout/type'
import { TemporaryLine } from '../render/connect/temporary-line'

export class Drag {
  private readonly options: Required<BadeMind.Options>
  private readonly cacheMap: BadeMind.CacheMap
  private readonly root: BadeMind.Root
  private readonly dragNode: BadeMind.Node
  private readonly ignoreNodes: BadeMind.Node[]
  private temporaryLine: TemporaryLine
  private readonly container: HTMLElement
  private readonly draggableLayout: typeof DraggableLayout

  constructor(context: {
    options: Required<BadeMind.Options>
    cacheMap: BadeMind.CacheMap
    root: BadeMind.Root
    dragNode: BadeMind.Node
    container: HTMLElement
  }) {
    const { options, root, dragNode, cacheMap, container } = context
    this.options = options
    this.root = root
    this.dragNode = dragNode
    this.cacheMap = cacheMap
    this.container = container
    this.draggableLayout = Process.getLayoutProcess(options) as any
    // 检查当前使用的算法是否支持拖拽操作
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
    attachedNodeChildren: BadeMind.Node[] | undefined,
    dropPosition: BadeMind.Coordinate,
    dragNode: BadeMind.Node,
    attachedNode: BadeMind.Node
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
  public drag = (position: BadeMind.Coordinate, canBeAttachedNodes: BadeMind.Node[]) => {
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
