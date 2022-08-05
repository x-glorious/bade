import { Helper } from '../../helper'
import { Mind } from '../../index'

// @ts-ignore
export class DraggableLayout {
  /**
   * 计算拖动关联信息
   * @param context 上下文
   * @param context.cacheMap 缓存地图
   * @param context.draggingRect 正在拖动节点的大小以及位置
   * @param context.canBeAttachedNodes 可以被关联的节点
   * @param context.ignoreNodes 需要被忽略的节点
   * @param context.root 根节点
   * @param context.options 选项
   * @return 如果没有合法的节点关联，则返回`undefined`
   */
  public static calcDragAttach = (context: {
    cacheMap: Mind.CacheMap
    draggingRect: Mind.Coordinate & Mind.Size
    canBeAttachedNodes: Mind.Node[]
    ignoreNodes: Mind.Node[]
    root: Mind.Root
    options: Required<Mind.Options>
  }): Mind.DragAttach | undefined => {
    // 此处是为了 ts 报错
    context = context
    throw Helper.error('DraggableLayout static calcDragAttach must be implemented')
  }

  /**
   * 计算拖动结束被放置的下标
   * @param context 上下文
   * @param context.cacheMap 缓存地图
   * @param context.attachedNodeChildren 关联节点子代
   * @param context.dropPosition 拖拽结束位置
   * @param context.root 根节点
   */
  public static calcDropIndex = (context: {
    cacheMap: Mind.CacheMap
    attachedNodeChildren: Mind.Node[] | undefined
    dropPosition: Mind.Coordinate
    attachedNode: Mind.Node
    dragNode: Mind.Node
    root: Mind.Root
    options: Mind.Options
  }): number => {
    // 此处是为了 ts 报错
    context = context
    throw Helper.error('DraggableLayout static calcDropIndex must be implemented')
  }

  /**
   * 是否为合法的继承了这个类的类对象
   * @param classObject
   */
  public static isValidExtendsClass = (classObject: any) => {
    const shouldBeRealizedFunc = ['calcDragAttach', 'calcDropIndex']
    return classObject && shouldBeRealizedFunc.every((func) => classObject[func])
  }
}
