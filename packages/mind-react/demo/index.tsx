import * as React from 'react'
import { useState } from 'react'
import ReactDom from 'react-dom'

import { BadeMind } from 'bade-mind'

import { BadeMindReact } from '../lib'
import { baseRoot } from '../test/mock'

const Render = (props: {
  node: BadeMind.Node
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}) => {
  const { node, onClick } = props
  return (
    <div className={'node'} onMouseUp={onClick} onClick={onClick}>
      {node.attachData}
    </div>
  )
}

const generateChildren = () => {
  const result: BadeMindReact.Node[] = []
  const num = Math.ceil(10 * Math.random())
  for (let counter = 0; counter < num; counter++) {
    result.push({
      attachData: Math.random(),
      children: [],
      id: Math.random().toString()
    })
  }
  return result
}

const Demo = () => {
  const [data, setData] = useState<BadeMindReact.Root>(baseRoot)
  const [anchor, setAnchor] = useState<string | undefined>()
  return (
    <BadeMindReact.Graphic
      data={data}
      anchor={anchor}
      scrollbar={true}
      render={(node) => (
        <Render
          node={node}
          onClick={(e) => {
            setAnchor(node.id)
            if (e.button === 2) {
              // 根节点（特殊处理，因为引用不一样）
              if (node.id === data.node.id) {
                data.node.fold = !data.node.fold
              } else {
                node.fold = !node.fold
              }
              setData((pre) => {
                return { ...pre }
              })
            } else {
              if (!node.children) {
                node.children = []
              }
              node.children.push(...generateChildren())
              setData((pre) => {
                return { ...pre }
              })
            }
          }}
        />
      )}
      options={{
        childAlignMode: BadeMind.ChildAlignMode.structured,
        direction: BadeMind.Direction.y,
        // lineStyle: BadeMind.LinkStyle.line,
        nodeSeparate: 20,
        rankSeparate: 100,
        viewportPreloadPadding: 10
      }}
      onUpdated={(mind) => {
        if (!anchor) {
          mind.nodeTranslateTo({
            diff: {
              x: 0,
              y: 0
            },
            id: 'root',
            relative: {
              x: BadeMind.RelativeX.middle,
              y: BadeMind.RelativeY.top
            }
          })
        }
      }}
    />
  )
}
ReactDom.render(<Demo />, document.getElementById('root'))
