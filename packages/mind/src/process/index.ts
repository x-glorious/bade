import { Zoom } from '../graphic/zoom'
import { BadeMind } from '../index'
import { Anchor as AnchorProcess } from './anchor'
import {
  DescendantCenterLayout as DescendantCenterLayoutProcess,
  HeirCenterLayout as HeirCenterLayoutProcess,
  StructuredLayout as StructuredLayoutProcess
} from './layout'
import { Line as LineProcess } from './Line'
import { NodeValid as NodeValidProcess } from './node-valid'
import { Orientation as OrientationProcess } from './orientation'
import { Size as SizeProcess } from './size'
import { Visible as VisibleProcess } from './visible'

export namespace Process {
  export type getRootHeirOrientationFunc = (id: string) => BadeMind.Orientation
  export interface EveryContext {
    /**
     * 当前处理节点缓存信息
     */
    cache: BadeMind.NodeCache
  }

  export interface StartContext {
    /**
     * 配置项
     */
    options: Required<BadeMind.Options>
    /**
     * 根数据
     */
    root: BadeMind.Root
    /**
     * 获取根直系子代的方位
     * @param id 直系子代 id
     */
    getRootHeirOrientation: getRootHeirOrientationFunc
    /**
     * 缓存地图
     */
    cacheMap: BadeMind.CacheMap
    /**
     * 上一次的缓存地图
     */
    preCacheMap?: BadeMind.CacheMap
    /**
     * 可视窗口
     */
    viewport: HTMLElement
    /**
     * 内容容器
     */
    container: HTMLElement
    /**
     * 位移/缩放配置
     */
    transform: BadeMind.Transform
    /**
     * 配置锚点
     */
    anchor?: string
    /**
     * 位移/缩放控制器
     */
    zoom: Zoom
  }

  export interface Lifecycle<S = void, E = void, AE = void, END = void> {
    /**
     * 开始步骤
     */
    start?: (context: StartContext) => S
    /**
     * 每一个节点处理（开始深度优先递归子代之前）
     * @param context 上下文环境
     */
    every?: (context: EveryContext) => E
    /**
     * 每一个节点处理（结束深度优先递归子代之后）
     * @param context 上下文环境
     */
    afterEvery?: (context: EveryContext) => AE
    /**
     * 结束处理步骤
     */
    end?: () => END
  }

  export const Size = SizeProcess

  export const HeirCenterLayout = HeirCenterLayoutProcess

  export const DescendantCenterLayout = DescendantCenterLayoutProcess

  export const StructuredLayout = StructuredLayoutProcess

  export const Visible = VisibleProcess

  export const Line = LineProcess

  export const Orientation = OrientationProcess

  export const Anchor = AnchorProcess

  export const NodeValid = NodeValidProcess

  export const getLayoutProcess = (options: Required<BadeMind.Options>) => {
    const matchMap = {
      [BadeMind.ChildAlignMode.heirCenter]: HeirCenterLayoutProcess,
      [BadeMind.ChildAlignMode.descendantCenter]: DescendantCenterLayoutProcess,
      [BadeMind.ChildAlignMode.structured]: StructuredLayoutProcess
    }

    return options.layoutProcess ? options.layoutProcess : matchMap[options.childAlignMode!]
  }
}
