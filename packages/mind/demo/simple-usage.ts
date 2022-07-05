import { BadeMind } from '../lib'

const rootHtml = `<div class="node-content root-node" style="width: 100px;height: 100px;box-sizing: content-box;">Root</div>`

// 简单测量html字符串内容尺度
export const measureSize = (html: string, viewport: HTMLElement) => {
  const size: BadeMind.Size = {
    height: 0,
    width: 0
  }
  const container = document.createElement('div')
  // 将内容脱离文档流并且完全隐藏起来
  container.style.cssText =
    'position:fixed;top:0;left:0;pointer-events:none;visibility:hidden;opacity:0;overflow:hidden;'
  container.innerHTML = html
  viewport.appendChild(container)
  size.width = container.clientWidth
  size.height = container.clientHeight

  // 测量完成移除
  viewport.removeChild(container)

  return size
}

const generateRoot = (viewport: HTMLElement): BadeMind.Root => ({
  negative: [
    {
      children: [
        {
          id: 'n-2-l',
          sizeof: () => ({
            height: 25,
            width: 50
          })
        }
      ],
      id: 'n-1-w-c',
      sizeof: () => ({
        height: 25,
        width: 50
      })
    },
    {
      id: 'n-1-l',
      sizeof: () => ({
        height: 50,
        width: 100
      })
    }
  ],
  node: {
    id: 'root',
    sizeof: () => measureSize(rootHtml, viewport)
  },
  positive: [
    {
      children: [
        {
          id: 'p-2-l',
          sizeof: () => ({
            height: 25,
            width: 50
          })
        }
      ],
      id: 'p-1-w-c',
      sizeof: () => ({
        height: 25,
        width: 50
      })
    },
    {
      id: 'p-1-l',
      sizeof: () => ({
        height: 50,
        width: 100
      })
    }
  ]
})

window.onload = () => {
  const viewport = document.getElementById('root')!
  const container = document.getElementById('container')
  const nodeContainer = document.getElementById('node-container')
  let graphic: BadeMind.Graphic | undefined = undefined
  const root = generateRoot(viewport)

  graphic = new BadeMind.Graphic(viewport, container, {
    callback: {
      onNodeVisibleChange: (nodes) => {
        nodeContainer.innerHTML = nodes
          .map((node) => {
            const anchor = graphic.getNodeAnchorCoordinate(node.id)
            let content = ''
            if (node.id === root.node.id) {
              content = rootHtml
            } else {
              content = `<div class="node-content" style="width: ${node.sizeof().width}px;height: ${
                node.sizeof().height
              }px;"></div>`
            }

            return `<div class="node" style="transform: translateX(${anchor.x}px) translateY(${anchor.y}px)">${content}</div>`
          })
          .join('')
      }
    },
    childAlignMode: BadeMind.ChildAlignMode.structured,
    lineStyle: BadeMind.LinkStyle.line,
    pathRender: (context) => {
      const { source, target } = context
      return `M${source.x},${source.y}L${target.x},${target.y}`
    }
  })

  graphic.setData(root)
}
