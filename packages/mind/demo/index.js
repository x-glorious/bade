import { Mind } from '../lib'

const generateRoot = () => ({
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
    sizeof: () => ({
      width: 100,
      height: 100
    })
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
  const viewport = document.getElementById('root')
  const container = document.getElementById('container')
  const nodeContainer = document.getElementById('node-container')
  let graphic = undefined
  const root = generateRoot()

  graphic = new Mind.Graphic(viewport, container, {
    callback: {
      onNodeVisibleChange: (nodes) => {
        nodeContainer.innerHTML = nodes
          .map((node) => {
            const anchor = graphic.getNodeAnchorCoordinate(node.id)
            let content = ''
            const isRoot = node.id === root.node.id

            content = `
              <div class="${isRoot ? 'root-node' : ''} node-content" 
              style="
                width:  ${node.sizeof().width}px;
                height: ${node.sizeof().height}px;
              ">
                  ${isRoot ? 'root' : ''}
              </div>`

            return `<div class="node" style="transform: translateX(${anchor.x}px) translateY(${anchor.y}px)">${content}</div>`
          })
          .join('')
      }
    },
    childAlignMode: Mind.ChildAlignMode.structured
  })

  graphic.setData(root)
}
