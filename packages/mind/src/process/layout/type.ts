import { Helper } from '../../helper'
import { BadeMind } from '../../index'

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
    cacheMap: BadeMind.CacheMap
    draggingRect: BadeMind.Coordinate & BadeMind.Size
    canBeAttachedNodes: BadeMind.Node[]
    ignoreNodes: BadeMind.Node[]
    root: BadeMind.Root
    options: Required<BadeMind.Options>
  }): BadeMind.DragAttach | undefined => {
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
   * @oaram context.Node 拖拽节点
   */
  public static calcDropIndex = (context: {
    cacheMap: BadeMind.CacheMap
    attachedNodeChildren: BadeMind.Node[] | undefined
    dropPosition: BadeMind.Coordinate
    attachedNode: BadeMind.Node
    dragNode: BadeMind.Node
    root: BadeMind.Root
    options: BadeMind.Options
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
