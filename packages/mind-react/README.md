# bade-mind-react

**`bade-mind`** React 框架封装库  

- **实现**了节点的`sizeof`函数，能够自动测量节点尺寸，并添加缓存功能 ，用户只需要负责渲染节点即可

- **增加**滚动条交互  

- **增加**滚轮手势交互  

- **实现**拖拽功能（内置布局只有`structured`支持拖拽）

[Live demo](https://codesandbox.io/s/bade-mind-react-iig1jh)

## Installation

```shell
npm install bade-mind-react
```

## Simple demo

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
    <title>bade-mind-react demo</title>
    <style>
        body,#root{
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }

        /* 定义链接线样式 */
        #root .mind__lines{
            stroke: #474b4c;
            stroke-width: 3px;
        }

        .node{
            font-size: 16px;
            color: white;
            padding: 8px 12px;
            background: #1f2623;
            border-radius: 8px;
            box-shadow: 2px 2px 8px #666;
            position: relative;
        }

        .fold{
            position: absolute;
            width: 8px;
            height: 8px;
            background: red;
            right: 0;
            top: 50%;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script src="./simple-usage.tsx" type="module"></script>
</body>
</html>
```

```tsx
import * as React from 'react'
import { useCallback, useState } from 'react'
import ReactDom from 'react-dom'

import { Mind, MindReact } from 'bade-mind-react'

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
```

## API

### Mind

组件依赖的`bade-mind`库导出

### MindReact

组件内部已自动实现`sizeof`函数，故而不需要用户再次处理

组件对`Mind`原有类型进行了一定的修改、拓展

### MindReact.View

脑图可视化组件

#### Props

| 参数             | 类型                  | 默认值       | 必填  | 说明             |
|:-------------- |:------------------- | --------- |:---:|:-------------- |
| options        | Mind.Options        | undefined | 否   | mind配置项        |
| data           | Root                | 无         |     | 数据源            |
| render         | Render              | 无         | 是   | 节点渲染器          |
| anchor         | string              | undefined | 否   | 渲染锚点数据         |
| scrollbar      | boolean             | false     | 否   | 是否展示滚动条        |
| wheelMoveSpeed | number              | 0.5       | 否   | 滚轮移动速度         |
| className      | string              | undefined | 否   | 注入到根上的 `class` |
| style          | React.CSSProperties | undefined | 否   | 注入到根上的 `style` |

---

**options、data、render**

- 仅做**浅比较**

- 改变则**会**引起 **布局重计算**

- 改变**会**引起 **节点规则内尺寸刷新**
  
  1. `node.size` 存在，则直接使用其数据
  
  2. 如果`node.disableSizeCache=true`，则，刷新节点尺寸
  
  3. 如果外部设置`node.needUpdateSize=true`，则，**本次**节点尺寸会被刷新
  
  4. 如上述条件都不符合，并且**节点之前已存在**，则，**节点不刷新其自身尺寸**

#### Events

| 事件名         | 事件类型                         | 必填  | 说明                                                                          |
|:----------- |:---------------------------- |:---:|:--------------------------------------------------------------------------- |
| onUpdated   | (mind: Mind.Graphic) => void | 否   | 图形更新完成<br/>- 由 data 和 options 改变所引起，脑图控制对象内部状态刷新<br/>- 即，此时，脑图所有的状态以及渲染已经完成 |
| onDragStart | DragStartEvent               | 否   | 拖拽开始事件                                                                      |
| onDrag      | DragEvent                    | 否   | 拖拽中事件                                                                       |
| onDragEnd   | DragEndEvent                 | 否   | 拖拽结束事件                                                                      |

### Node

所有的节点数据改变之后，都需要更新`data`的引用，以通知组件

```tsx
interface Node extends Omit<Mind.Node, 'sizeof' | 'children'> {
    /**
     * 当设置 size 时，将会禁止自动测量，提升速率
     */
    size?: Mind.Size
    /**
     * 是否需要更新节点尺寸（设置为true之后会更新一次节点尺寸，后组件将自动设置此值为false）
     * @default false
     */
    needUpdateSize?: boolean
    /**
     * 节点是否受到保护（超出可视区域不会被销毁，但会设置`visible=hidden`）
     * @default false
     */
    beProtected?: boolean
    /**
     * 节点总是可见（超出可视区域不会被销毁也不会改变`visible`状态）
     * @default false
     */
    alwaysVisible?: boolean
    /**
     * 禁用尺寸缓存
     * @default false
     */
    disableSizeCache?: boolean
    /**
     * 子代节点
     */
    children?: Node[]
    /**
     * 节点是否可拖拽
     * - 需要当前布局算法支持拖拽
     * @default false
     */
    draggable?: boolean
    /**
     * 节点是否可被拖拽节点依附作为其子节点
     * @default true
     */
    droppable?: boolean
}
```

### Root

```tsx
interface Root {
    node: Node
    positive?: Node[]
    negative?: Node[]
}
```

### Render

节点渲染器

```tsx
type Render = (data: Node, mirror: boolean) => React.ReactNode
```

- **@param** `data` 节点数据

- **@param** `mirror` 是否为镜像节点（拖拽所产生的）渲染

### DragStartEvent

拖拽节点开始事件

```tsx
type DragStartEvent = (event: { node: Node }) => void
```

- **@param** `node` 拖拽的节点

### DragEvent

节点拖拽中事件

```tsx
type DragEvent = (event: {
    node: Node
    attach:
      | {
          parent: Node
          orientation: Mind.Orientation
        }
      | undefined
    mirrorPosition: Mind.Coordinate
}) => void
```

* **@param** `event.node` 拖拽的节点  
* **@param** `event.attach` 拖拽节点关联的节点（关联父级），可能为空  
* **@param** `event.position` 拖拽节点镜像中心当前位置  
* **@param** `event.orientation `拖拽节点当前位于哪个区域（位于根节点区域时为空，此时无法附着在任何一个节点上）

### DragEndEvent

拖拽结束事件

```tsx
type DragEndEvent = (event: {
    node: Node
    attach:
      | {
          parent: Node
          orientation: Mind.Orientation
          index: number
        }
      | undefined
    original: {
      parent: Node
      orientation: Mind.Orientation
    }
}) => void
```

* **@param** `event.node` 拖拽的节点  
* **@param** `event.attach` 拖拽节点最终关联的节点（关联父级），可能为空  
* **@param** `event.orientation` 拖拽节点当前最终位于哪个区域（位于根节点区域时为空，此时无法附着在任何一个节点上）  
* **@param** `event.id` 拖拽节点位于最终关联节点子代（关联父级）中的目标位置（-1代表无需改变位置）（需要注意的是，关联的父节点可能仍然是拖动节点自身的父节点）

## Tips

### 渲染初始定位

可使用`onUpdated`在渲染完成之后，改变位移缩放等  

- 谨记，`onUpdated`会在每一次**脑图渲染更新完成**之后调用  

```tsx
onUpdated={(mind) => {
    // 如果只需要初次渲染修改位移，则需要在此处做逻辑判断处理
    // 将root移动到viewport上中
    mind.nodeTranslateTo({
        diff: {
            x: 0,
            y: 0
        },
        id: 'root',
        relative: {
            x: Mind.RelativeX.middle,
            y: Mind.RelativeY.top
        }
    })
}MindReact.Node
```
