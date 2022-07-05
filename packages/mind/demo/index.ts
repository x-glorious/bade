import { BadeMind } from '../lib'
import { baseRoot } from '../test/mock'

const viewport = document.getElementById('root')!
const container = document.getElementById('container')
const nodeContainer = document.getElementById('node-container')

// 测试 html 效果
baseRoot.node.html = '<div style="width: 200px;height:200px;"></div>'
baseRoot.node.size = undefined

let graphic: any

const transformCache: BadeMind.Transform = { scale: 1, x: 0, y: 0 }

const updateTranslateExtent = () => {
  const viewportSize: BadeMind.Size = {
    height: viewport.clientHeight,
    width: viewport.clientWidth
  }
  const containerSize: BadeMind.Size = {
    height: container.clientHeight,
    width: container.clientWidth
  }

  if (graphic) {
    graphic.setOptions(
      {
        zoomExtent: {
          translate: [
            {
              x: -viewportSize.width / transformCache.scale,
              y: -viewportSize.height / transformCache.scale
            },
            {
              x: containerSize.width + viewportSize.width / transformCache.scale,
              y: containerSize.height + viewportSize.height / transformCache.scale
            }
          ]
        }
      },
      true
    )
  }
}

graphic = new BadeMind.Graphic(viewport, container, {
  callback: {
    onNodeVisibleChange: (nodes) => {
      nodeContainer.innerHTML = nodes
        .map((node) => {
          const anchor = graphic.getNodeAnchorCoordinate(node.id)
          if (node.id === baseRoot.node.id) {
            return `<div style="width: 200px;height:200px;background:green;position: absolute;left: ${anchor.x}px;top:${anchor.y}px"></div>`
          }
          return `<div id="${node.id}" style="background:red;width:${node.size.width}px;height: ${node.size.height}px;position: absolute;left: ${anchor.x}px;top:${anchor.y}px"></div>`
        })
        .join('')
    },
    onTransformChange: (transform) => {
      transformCache.x = transform.x
      transformCache.y = transform.y
      transformCache.scale = transform.scale
      updateTranslateExtent()
    }
  },
  childAlignMode: BadeMind.ChildAlignMode.structured,
  direction: BadeMind.Direction.y
  // lineStyle: BadeMind.LinkStyle.line
})

new ResizeObserver(updateTranslateExtent).observe(container)
new ResizeObserver(updateTranslateExtent).observe(viewport)
graphic.setData(baseRoot)

setTimeout(() => {
  const modify = baseRoot
  baseRoot.negative.find((item) => item.id === 'n-2-leaf').children = [
    {
      id: 'n-3-add-1',
      size: {
        height: 120,
        width: 240
      }
    },
    {
      id: 'n-3-add-2',
      size: {
        height: 240,
        width: 480
      }
    }
  ]

  graphic.setAnchor('n-2-leaf')
  graphic.setData(modify)
}, 3000)

setTimeout(() => {
  graphic.nodeTranslateTo(
    {
      diff: { x: 0, y: 100 },
      id: 'root',
      relative: {
        x: 'middle',
        y: 'top'
      }
    },
    200
  )
}, 6000)

setTimeout(() => {
  baseRoot.negative.find((item) => item.id === 'n-2-leaf').fold = true
  graphic.setData(baseRoot)
}, 9000)
