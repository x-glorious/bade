// 规整模式布局，多用于组织结构等
// 边界对齐，并且布局规整，父级永远位于子代中间
import { Helper } from '../../../helper'
import { BadeMind } from '../../../index'
import { Process } from '../../index'
import { DraggableLayout } from '../type'
import { calcDragAttach } from './calc-drag-attach'
import { calcDropIndex } from './calc-drop-index'
import { getNodeCrossBoundary } from './get-node-cross-boundary'

export class StructuredLayout extends DraggableLayout implements Process.Lifecycle {
  private options: BadeMind.Options
  private cacheMap: BadeMind.CacheMap
  private root: BadeMind.Root
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
    const localityRect: BadeMind.Size & BadeMind.Coordinate = {
      height: cache.rect.height,
      width: cache.rect.width,
      x: 0,
      y: 0
    }

    cache.processCache.structuredLayout = {
      crossBoundary: [
        {
          max: Infinity,
          min: -Infinity
        },
        {
          max: Infinity,
          min: -Infinity
        }
      ],
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

    // 需要被计算的子代为空（被折叠或者没有子代）
    if (children.length === 0) {
      localityRect.x = cache.rect.width / 2
      localityRect.y = cache.rect.height / 2

      return
    }

    const main = {
      negative: 0,
      positive: 0
    }
    const cross = {
      negative: 0,
      positive: 0
    }

    const vertical = this.options.direction === BadeMind.Direction.y

    // 计算子代主轴范围
    // 计算子代副轴尺寸
    children.forEach((child) => {
      const childCache = this.cacheMap.get(child.id)!
      const childLocalityRect: BadeMind.Size & BadeMind.Coordinate =
        childCache.processCache.structuredLayout.localityRect
      const inParentPosition: BadeMind.Coordinate = { x: 0, y: 0 }
      childCache.processCache.structuredLayout.inParentPosition = inParentPosition

      if (vertical) {
        if (childCache.orientation === BadeMind.Orientation.positive) {
          if (childLocalityRect.height > main.positive) {
            main.positive = childLocalityRect.height
          }

          inParentPosition.x = cross.positive + childLocalityRect.width / 2
          cross.positive += childLocalityRect.width + this.options.nodeSeparate!
        }

        if (childCache.orientation === BadeMind.Orientation.negative) {
          if (childLocalityRect.height > main.negative) {
            main.negative = childLocalityRect.height
          }

          inParentPosition.x = cross.negative + childLocalityRect.width / 2
          cross.negative += childLocalityRect.width + this.options.nodeSeparate!
        }
      } else {
        if (childCache.orientation === BadeMind.Orientation.positive) {
          if (childLocalityRect.width > main.positive) {
            main.positive = childLocalityRect.width
          }

          inParentPosition.y = cross.positive + childLocalityRect.height / 2
          cross.positive += childLocalityRect.height + this.options.nodeSeparate!
        }

        if (childCache.orientation === BadeMind.Orientation.negative) {
          if (childLocalityRect.width > main.negative) {
            main.negative = childLocalityRect.width
          }

          inParentPosition.y = cross.negative + childLocalityRect.height / 2
          cross.negative += childLocalityRect.height + this.options.nodeSeparate!
        }
      }
    })

    // 去除多余的间距
    if (cross.positive) {
      cross.positive -= this.options.nodeSeparate!
    }
    if (cross.negative) {
      cross.negative -= this.options.nodeSeparate!
    }

    // 副轴尺寸
    const crossSize = Math.max(
      cross.positive,
      cross.negative,
      vertical ? cache.rect.width : cache.rect.height
    )

    // 计算节点区域坐标
    // 主轴两侧都有节点
    if (main.positive && main.negative) {
      // 垂直方向渲染，y模式下 positive 渲染在上侧
      if (vertical) {
        localityRect.y = main.positive + this.options.rankSeparate! + cache.rect.height / 2
        localityRect.x = crossSize / 2
        localityRect.width = crossSize
        localityRect.height =
          main.positive + main.negative + cache.rect.height + 2 * this.options.rankSeparate!
      }
      // 水平渲染，x模式下 positive 渲染在右侧
      else {
        localityRect.x = main.negative + this.options.rankSeparate! + cache.rect.width / 2
        localityRect.y = crossSize / 2
        localityRect.height = crossSize
        localityRect.width =
          main.negative + main.positive + cache.rect.width + 2 * this.options.rankSeparate!
      }
    }
    // 只有负向区域存在节点
    else if (main.negative && !main.positive) {
      // 节点位于最上方
      if (vertical) {
        localityRect.y = cache.rect.height / 2
        localityRect.x = crossSize / 2
        localityRect.width = crossSize
        localityRect.height = main.negative + cache.rect.height + this.options.rankSeparate!
      }
      // 节点位于最右侧
      else {
        localityRect.x = main.negative + this.options.rankSeparate! + cache.rect.width / 2
        localityRect.y = crossSize / 2
        localityRect.height = crossSize
        localityRect.width = main.negative + cache.rect.width + this.options.rankSeparate!
      }
    }
    // 只有正向区域存在节点
    else if (main.positive && !main.negative) {
      // 节点位于最下方
      if (vertical) {
        localityRect.y = main.positive + this.options.rankSeparate! + cache.rect.height / 2
        localityRect.x = crossSize / 2
        localityRect.width = crossSize
        localityRect.height = main.positive + cache.rect.height + this.options.rankSeparate!
      }
      // 节点位于最左侧
      else {
        localityRect.x = cache.rect.width / 2
        localityRect.y = crossSize / 2
        localityRect.height = crossSize
        localityRect.width = main.positive + cache.rect.width + this.options.rankSeparate!
      }
    }

    // 子代副轴原点偏移
    const childCrossOriginDiff = {
      negative: 0,
      positive: 0
    }
    // 垂直方向渲染，y模式下 positive 渲染在上侧
    if (vertical) {
      childCrossOriginDiff.positive = localityRect.x - cross.positive / 2
      childCrossOriginDiff.negative = localityRect.x - cross.negative / 2
    }
    // 水平渲染，x模式下 positive 渲染在右侧
    else {
      childCrossOriginDiff.positive = localityRect.y - cross.positive / 2
      childCrossOriginDiff.negative = localityRect.y - cross.negative / 2
    }

    // 计算子代位于父级区域内的坐标
    children.forEach((child) => {
      const childCache = this.cacheMap.get(child.id)!
      const inParentPosition: BadeMind.Coordinate =
        childCache.processCache.structuredLayout.inParentPosition
      const childLocalityRect: BadeMind.Size & BadeMind.Coordinate =
        childCache.processCache.structuredLayout.localityRect

      if (vertical) {
        // y 轴正向，位于节点上方
        if (childCache.orientation === BadeMind.Orientation.positive) {
          inParentPosition.y =
            localityRect.y -
            cache.rect.height / 2 -
            this.options.rankSeparate! -
            childLocalityRect.height / 2
          inParentPosition.x += childCrossOriginDiff.positive
        }
        // y 轴负向，位于节点下方
        if (childCache.orientation === BadeMind.Orientation.negative) {
          inParentPosition.y =
            localityRect.y +
            cache.rect.height / 2 +
            this.options.rankSeparate! +
            childLocalityRect.height / 2
          inParentPosition.x += childCrossOriginDiff.negative
        }
      } else {
        // x 轴，节点正向，右侧
        if (childCache.orientation === BadeMind.Orientation.positive) {
          inParentPosition.x =
            localityRect.x +
            cache.rect.width / 2 +
            this.options.rankSeparate! +
            childLocalityRect.width / 2
          inParentPosition.y += childCrossOriginDiff.positive
        }
        // x 轴，节点负向，左侧
        if (childCache.orientation === BadeMind.Orientation.negative) {
          inParentPosition.x =
            localityRect.x -
            cache.rect.width / 2 -
            this.options.rankSeparate! -
            childLocalityRect.width / 2
          inParentPosition.y += childCrossOriginDiff.negative
        }
      }
    })
  }

  end = () => {
    const rootCache = this.cacheMap.get(this.root.node.id)!
    const rootNode = rootCache.node
    // // 保存整体布局尺寸
    rootCache.layoutSize = {
      height: rootCache.processCache.structuredLayout.localityRect.height,
      width: rootCache.processCache.structuredLayout.localityRect.width
    }
    const vertical = this.options.direction === BadeMind.Direction.y

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
          cache.rect.x = cache.processCache.structuredLayout.localityRect.x
          cache.rect.y = cache.processCache.structuredLayout.localityRect.y
          cache.processCache.structuredLayout.origin = {
            x: 0,
            y: 0
          }
        }
        // 广度优先遍历，故而，节点所领导的区域位于的坐标系原点已确定
        else {
          const parentCache = this.cacheMap.get(cache.parent.id)!
          // 坐标系原点
          const origin = parentCache.processCache.structuredLayout.origin as BadeMind.Coordinate
          // 自身所领导区域位于父区域的位置
          const inParentPosition: BadeMind.Coordinate =
            cache.processCache.structuredLayout.inParentPosition
          // 自身所领导的区域容器矩形信息
          const localityReact: BadeMind.Size & BadeMind.Coordinate =
            cache.processCache.structuredLayout.localityRect

          // 节点所领导区域左上角坐标
          // 即，领导区域的原点
          const nodeOrigin: BadeMind.Coordinate = {
            x: origin.x + inParentPosition.x - localityReact.width / 2,
            y: origin.y + inParentPosition.y - localityReact.height / 2
          }
          cache.processCache.structuredLayout.origin = nodeOrigin

          // 根据区域原点计算出实际坐标
          cache.rect.x = localityReact.x + nodeOrigin.x
          cache.rect.y = localityReact.y + nodeOrigin.y
        }

        const crossBoundary: [BadeMind.Range<number>, BadeMind.Range<number>] =
          cache.processCache.structuredLayout.crossBoundary
        // 计算节点交叉轴范围
        if (vertical) {
          crossBoundary[0].min =
            cache.rect.x - cache.processCache.structuredLayout.localityRect.width / 2
          crossBoundary[0].max =
            cache.rect.x + cache.processCache.structuredLayout.localityRect.width / 2
        } else {
          crossBoundary[0].min =
            cache.rect.y - cache.processCache.structuredLayout.localityRect.height / 2
          crossBoundary[0].max =
            cache.rect.y + cache.processCache.structuredLayout.localityRect.height / 2
        }

        // 清空无用数据
        cache.processCache.structuredLayout.inParentPosition = undefined
        cache.processCache.structuredLayout.localityRect = undefined

        // 折叠，则，子代无需继续计算
        return !Helper.judgeIfAllChildFold(node, this.root.node.id)
      }
    })

    // 根节点交叉轴边界特殊处理
    // 根节点折叠特殊处理
    rootCache.processCache.structuredLayout.crossBoundary = [
      getNodeCrossBoundary(
        rootCache,
        (rootNode.fold || [])[0] ? [] : this.root.negative,
        vertical,
        this.cacheMap
      ),
      getNodeCrossBoundary(
        rootCache,
        (rootNode.fold || [])[1] ? [] : this.root.positive,
        vertical,
        this.cacheMap
      )
    ]
  }

  static calcDragAttach: typeof DraggableLayout.calcDragAttach = calcDragAttach

  static calcDropIndex: typeof DraggableLayout.calcDropIndex = calcDropIndex
}
