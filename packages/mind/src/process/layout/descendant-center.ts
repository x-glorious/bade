// 子代整体居中对齐布局
// 算法默认会将同一rank(层级)的直系子代，在垂直于布局的方向上中心对齐
// 故而通过递归，将所有后代统一视作一个整体计算尺寸，得出偏移
// 即可实现后代居中功能
import * as dagre from 'dagre'

import { Helper } from '../../helper'
import { Mind } from '../../index'
import { Process } from '../index'
import { generateDagreGraphic } from './dagre'

export class DescendantCenterLayout implements Process.Lifecycle {
  private options: Mind.Options
  private cacheMap: Mind.CacheMap
  private root: Mind.Root
  private getRootHeirOrientation: Process.getRootHeirOrientationFunc
  start = (context: Process.StartContext) => {
    const { options, cacheMap, root, getRootHeirOrientation } = context

    this.root = root
    this.options = options
    this.cacheMap = cacheMap
    this.getRootHeirOrientation = getRootHeirOrientation
  }

  // 递归返回，子节点处理完成
  afterEvery = (context: Process.EveryContext) => {
    const { cache } = context
    const { node } = cache
    // 区域矩形初始化为本身尺寸，用作计算
    const localityRect: Mind.Size & Mind.Coordinate = {
      height: cache.rect.height,
      width: cache.rect.width,
      x: 0,
      y: 0
    }

    cache.processCache.descendantCenterLayout = {
      localityRect
    }
    // 设置子代节点
    // 由于是深度优先遍历，并且 afterEvery 在子代遍历完成之后触发
    // 故而，子代本身得局部矩形信息已经计算完成
    const children = Helper.getLayoutCalcChildren(
      node,
      this.root.node.id,
      this.getRootHeirOrientation
    )
    // 子代为空，或者子代需要折叠，则，本身尺寸作为区域尺寸，x y 直接居中即可
    if (children.length === 0) {
      localityRect.x = cache.rect.width / 2
      localityRect.y = cache.rect.height / 2

      return
    }

    // 创建一个局部的计算图
    const graphic = generateDagreGraphic(this.options)
    // 设置区域根节点
    graphic.setNode(node.id, localityRect)

    children.forEach((child) => {
      const cache = this.cacheMap.get(child.id)!
      // 子节点区域矩形信息
      const localityRect = cache.processCache.descendantCenterLayout.localityRect
      // 子节点区域在父级区域矩形信息中的位置信息
      const localityRectInParent: Mind.Size & Mind.Coordinate = {
        height: localityRect.height,
        width: localityRect.width,
        x: 0,
        y: 0
      }
      cache.processCache.descendantCenterLayout.localityRectInParent = localityRectInParent

      graphic.setNode(child.id, localityRectInParent)
      if (cache.orientation === Mind.Orientation.positive) {
        graphic.setEdge(node.id, child.id)
      } else {
        graphic.setEdge(child.id, node.id)
      }
    })

    dagre.layout(graphic)

    const graph = graphic.graph()
    // 回填区域尺寸数据
    localityRect.width = graph.width!
    localityRect.height = graph.height!
  }

  end = () => {
    const rootCache = this.cacheMap.get(this.root.node.id)!
    const rootNode = rootCache.node
    // 保存整体布局尺寸
    rootCache.layoutSize = {
      height: rootCache.processCache.descendantCenterLayout.localityRect.height,
      width: rootCache.processCache.descendantCenterLayout.localityRect.width
    }
    Helper.breadthFirstWalkTree(rootNode, {
      after: () => {
        // default
      },
      before: (node) => {
        const cache = this.cacheMap.get(node.id)!
        if (
          !cache ||
          Helper.judgeIfHeirAndFold(node, cache.parent, this.root, this.getRootHeirOrientation)
        ) {
          return false
        }

        // 根节点，无父级，自身位置就是正确位置，原点位置为（0,0）
        if (!cache.parent) {
          cache.rect.x = cache.processCache.descendantCenterLayout.localityRect.x
          cache.rect.y = cache.processCache.descendantCenterLayout.localityRect.y
          cache.processCache.descendantCenterLayout.origin = {
            x: 0,
            y: 0
          }
        }
        // 广度优先遍历，故而，节点所领导的区域位于的坐标系原点已确定
        else {
          const parentCache = this.cacheMap.get(cache.parent.id)!
          // 坐标系原点
          const origin = parentCache.processCache.descendantCenterLayout
            .origin as Mind.Coordinate
          // 自身所领导的区域容器位于父容器的矩形信息
          const localityRectInParent: Mind.Size & Mind.Coordinate =
            cache.processCache.descendantCenterLayout.localityRectInParent
          // 自身所领导的区域容器矩形信息
          const localityReact: Mind.Size & Mind.Coordinate =
            cache.processCache.descendantCenterLayout.localityRect

          // 节点所领导区域左上角坐标
          // 即，领导区域的原点
          const nodeOrigin: Mind.Coordinate = {
            x: origin.x + localityRectInParent.x - localityRectInParent.width / 2,
            y: origin.y + localityRectInParent.y - localityRectInParent.height / 2
          }
          cache.processCache.descendantCenterLayout.origin = nodeOrigin

          // 根据区域原点计算出实际坐标
          cache.rect.x = localityReact.x + nodeOrigin.x
          cache.rect.y = localityReact.y + nodeOrigin.y

          // 清空无用数据
          cache.processCache.descendantCenterLayout.localityRectInParent = undefined
          cache.processCache.descendantCenterLayout.localityRect = undefined
        }

        // 折叠，则，子代无需继续计算
        return !Helper.judgeIfAllChildFold(node, this.root.node.id)
      }
    })
  }
}
