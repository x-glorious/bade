import * as React from 'react'
import { useCallback, useState } from 'react'
import ReactDom from 'react-dom'

import { Mind, MindReact } from '../lib'

const root: MindReact.Root = {
  negative: [
    {
      attachData: 'negative',
      id: 'n-1-l'
    }
  ],
  // negative: [],
  node: {
    attachData: 'root',
    id: 'root'
  },
  positive: [
    {
      attachData: 'positive',
      id: 'p-1-l'
    }
  ]
}

const generateChildren = () => {
  const result: MindReact.Node[] = []
  const num = Math.ceil(3 * Math.random())
  for (let counter = 0; counter < num; counter++) {
    result.push({
      attachData: Math.random().toFixed(6),
      draggable: true,
      id: Math.random().toString()
    })
  }
  return result
}

const Render = (props: {
  node: MindReact.Node
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  onFold: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}) => {
  const { node, onClick, onFold } = props
  return (
    <div className={'node'} onClick={onClick}>
      {node.attachData}
      <div
        onClick={(e) => {
          onFold(e)
          e.stopPropagation()
        }}
        className={'fold'}
      />
    </div>
  )
}

const options: Mind.Options = {
  childAlignMode: Mind.ChildAlignMode.structured,
  lineStyle: Mind.LinkStyle.bezier,
  nodeSeparate: 80,
  rankSeparate: 100
}

const Demo = () => {
  const [data, setData] = useState<MindReact.Root>(root)
  const [anchor, setAnchor] = useState<string | undefined>()

  const onDragEnd = useCallback<MindReact.DragEndEvent>(
    (event) => {
      const { attach, node, original } = event
      if (attach && attach.index >= 0) {
        let children: MindReact.Node[] = []
        // 如果为根节点
        if (attach.parent.id === data.node.id) {
          if (attach.orientation === Mind.Orientation.positive) {
            children = data.positive = data.positive || []
          } else {
            children = data.negative = data.negative || []
          }
        } else {
          children = attach.parent.children = attach.parent.children || []
        }

        // 插入到对应位置
        // ... 创建新对象插入(避免在同一父级下拖拽，后续删除无法辨别旧节点的情况)
        children.splice(attach.index, 0, {
          ...node
        })

        let originalPlaceNodes = []
        // 原始父节点为根节点
        if (original.parent.id === data.node.id) {
          originalPlaceNodes =
            original.orientation === Mind.Orientation.positive ? data.positive : data.negative
        } else {
          originalPlaceNodes = original.parent.children
        }
        const dragNodeIndex = originalPlaceNodes.indexOf(node)

        if (dragNodeIndex >= 0) {
          originalPlaceNodes.splice(dragNodeIndex, 1)
        }

        setAnchor(attach.parent.id)
        setData((pre) => ({ ...pre }))
      }
    },
    [data]
  )
  return (
    <MindReact.View
      data={data}
      anchor={anchor}
      scrollbar={true}
      onDragEnd={onDragEnd}
      render={(node) => (
        <Render
          node={node}
          onClick={(e) => {
            setAnchor(node.id)
            if (node.id !== root.node.id) {
              if (!node.children) {
                node.children = []
              }
              node.children.push(...generateChildren())
              setData((pre) => {
                return { ...pre }
              })
            }
          }}
          onFold={() => {
            setAnchor(node.id)
            if (node.id === data.node.id) {
              node.fold = []
            } else {
              node.fold = !node.fold
            }
            setData((pre) => {
              return { ...pre }
            })
          }}
        />
      )}
      options={options}
    />
  )
}
ReactDom.render(<Demo />, document.getElementById('root'))
