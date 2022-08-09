# bade-mind

- 脑图内核，并不依赖于任何UI框架，只实现逻辑以及链接渲染
- 内核不负责节点渲染
- node **`sizeof`** 函数为用户需要**重点注意以及实现的点**
- 内核直接使用比较复杂，可使用UI框架封装版本
  - React 框架：`bade-mind-react`

[Live demo](https://codesandbox.io/s/bade-mind-l6zr1b)

## Installation

```shell
npm install bade-mind
```

## Simple demo

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>bade-mind demo</title>
    <style>
        body,#root{
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
        }

        #container{
            position: relative;
            width: fit-content;
            height: fit-content;
        }

        #node-container{
            position: absolute;
            left: 0;
            top: 0;
        }

        /* 定义链接线样式 */
        .mind__lines{
            stroke: #2775b6;
            stroke-width: 3px;
        }

        .node{
            position: absolute;
            left: 0;
            top: 0;
        }

        .node-content{
            background: #57c3c2;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .root-node{
            color: white;
            background: #440e25;
        }
    </style>
</head>
<body>
<div id="root">
    <div id="container">
        <div id="node-container"></div>
    </div>
</div>
<script src="./index.js" type="module"></script>
</body>
</html>
```

```js
import { Mind } from 'bade-mind'

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
  const root = generateRoot(viewport)

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
```

## Usage

### 1. sizeof

首先需要自定义实现每一个节点中的`sizeof`函数，内核会在计算各节点图层位置时调用此函数获取节点尺寸

- 如果`sizeof`函数需要耗费大量计算资源，则需要外部自行使用缓存等方案，**内核将不会缓存`sizeof`结果**

### 2. container & viewport

准备两个dom作为容器

- `viewport`为屏幕可视区域，内核将会**监听其尺寸执行区域渲染操作**

- `container`为渲染容器，
  
  - 需要将节点渲染于其中
  
  - 内核将会自动注入`svg`标签（链接线）作为其直系子代

### 3. onNodeVisibleChange & judgeNodeVisible

- 可通过`onNodeVisibleChange`事件直接获取可视的节点用作后续渲染

- 也可以`onNodeVisibleChange`事件驱动重新渲染，通过`judgeNodeVisible`判断每一个节点是否可视，然后渲染

### 4. render

内核交由节点渲染部分给用户自行渲染

- `getNodeAnchorCoordinate`用作获取节点渲染锚点坐标（左上角）

- **建议**所有节点设置`position:absolute;top:0;left:0;`，然后使用`transform`做坐标偏移（避免出现渲染错误的情况）

### 5. setData、setOptions

使用`setData`函数设置/更新数据，启动重渲染

- **内核将不会做任何数据比较**，只要调用了函数，则视作数据变化，启动渲染

使用`setOptions`函数设置/更新配置信息，如果需要重渲染，则需要手动调用`setData`

## Class

### Graphic

脑图绘制控制类

#### constructor

```tsx
constructor(
    viewport: HTMLElement,
    container: HTMLElement,
    options?: Mind.Options
)
```

- **param** **`viewport`** 视窗（可视区域）

- **param** **`container`** 容器
  
  - `svg`链接线将会作为一个`svg tag`自动注入到`container`中
  
  - 位移、脑图绘制尺寸将会自动注入到`container`中
    
    - **请勿**在外部手动**修改**`container` `width`、`height`、`transform`、`transformOrigin` 属性

- **param** **`options`** 配置参数

#### getNodeAnchorCoordinate

获取节点定位锚点（左上角）位置，可在节点绘制的时候确定其位置

- 推荐所有节点使用`position:absolute;left:0;top:0;`并且配合`transform`来定位，避免出现绘制异常

```tsx
function getNodeAnchorCoordinate(id: string): Mind.Coordinate | undefined
```

- **@param** `id` 节点对应id

#### unbind

注销事件绑定

- 请在销毁组件之前调用

```tsx
function unbind(): void
```

#### judgeNodeVisible

判断节点是否可视

```tsx
function judgeNodeVisible(id: string): boolean
```

- **@param** `id` 节点对应id

#### setOptions

设定 `options` 

* 函数不会自动执行重渲染，如果改变的`options`需要重新计算布局等操作，推荐使用 `setData` 驱动数据重渲染

```tsx
function setOptions(options?: Mind.Options, isMerge: boolean = false): voi
```

* **@param** `options` 设定选项  
* **@param** `isMerge` 是否与之前的`options`做合并操作

#### dragControllerBuilder

生成拖动控制器

- 根节点不可拖拽

- 当前暂时只有`Mind.ChildAlignMode.structured`布局算法支持拖拽功能

```tsx
function dragControllerBuilder(drag: Mind.Node | string): Drag | undefined
```

- **@param** `drag` 拖动节点`node`对象或`id`

- **@return**
  
  - 当**root**（没有调用`setData`）不存在时，或者`drag`为根节点时，返回`undefined`
  
  - 正常情况返回 `Drag` 类对象

#### getLayoutSize

获取渲染层尺寸

```tsx
function getLayoutSize(): Mind.Size | undefined
```

#### getNode

获取`id`对应节点

```tsx
function getNode(id: string): Mind.Node | undefined
```

- **@param** `id` 节点id

#### getParent

获取`id`对应父节点

```tsx
function getParent(id: string): Mind.Node | undefined
```

**@param** `id` 节点id

#### getNodeOrientation

获取`id`对应节点渲染方位

```tsx
function getNodeOrientation(id: string): Mind.Orientation | undefined
```

**@param** `id` 节点id

#### setTransform

主动设置位移缩放

- 会与之前的`transform`做深度合并

- 请注意：`setTransform` 之后 `onTransformChange` 事件依旧会触发

- 此方法不受 `zoomExtent.translate`、`zoomExtent.scale` 限制，使用需谨慎

```tsx
function setTransform(transform: Partial<Mind.Transform>,duration?: number): void
```

- **@param** `transform` 位移缩放数据

- **@param** `duration` 周期，如果配置，则执行变换会附带动画效果

#### translate

设定位移

- 此方法受到 `zoomExtent.translate` 限制

```tsx
function translate(translate: Mind.Coordinate,duration?: number): void
```

- **@param** `translate` 位移差(屏幕尺度)

- **@param** `duration`周期，如果配置，则执行变换会附带动画效果

#### scale

设定缩放

- 此方法受到 `zoomExtent.translate` 限制  
* 此方法受到 `zoomExtent.scale` 限制

```tsx
function scale(
    scale: number,
    point?: Mind.Coordinate,
    duration?: number): void
```

- **@param** `scale` 缩放比

- **@param** `point` 缩放相对点（如不配置或为`undefined`，则默认相对于`viewport`中心缩放）

- **@param** `duration` 动画周期，如配置，则位移会附带动画效果

#### nodeTranslateTo

将某一个节点中心从某个相对位置做位移（其尺度为屏幕尺度）操作

- 此方法不受 `zoomExtent.translate` 限制

```tsx
function nodeTranslateTo(
    config: {id: string, diff: Mind.Coordinate, relative: Mind.Relative},
    duration?: number): void
```

* **@param** `config` 配置参数  
* **@param** `config.id` 节点id  
* **@param** `config.diff` 位移差  
* **@param** `config.relative` 相对位置  
* **@param** `duration` 动画周期，如配置，则位移会附带动画效果

#### getTransform

获取位移缩放信息

```tsx
function getTransform(): Mind.Transform
```

#### setAnchor

设置锚点节点

```tsx
function setAnchor(id?: string): void
```

- **@param** `id` 锚定节点id(如不设定，则清空锚点，根节点居中，缩放比归一)

#### setData

设置/更新数据，启动重渲染

- 在重计算定位时，将保持 `anchor` 对应节点在屏幕上的相对位置不变
- 如果 `anchor` 没有设定，或者找不到对应节点，则，根节点居中，缩放比重置为1

```tsx
function setData(root: Mind.Root): void
```

- **@param** `root` 根数据

#### refresh

刷新布局，启动重渲染

其用法与`setData`一致，使用的是内部存储的数据

### Drag

拖动逻辑相关控制类，实现拖拽计算逻辑，不与特定手势关联

- **推荐使用**`Graphic.dragControllerBuilder`生成，自动注入所需数据，不推荐手动`new`初始化对象
- 需要当前使用的布局类型支持拖拽

#### constructor

```tsx
constructor(context: {
    options: Required<Mind.Options>, 
    cacheMap: Mind.CacheMap, 
    root: Mind.Root, 
    dragNode: Mind.Node,
container: HTMLElement
})
```

#### calcDropIndex

**获取**拖动节点插入到关联节点子代的**下标**

```tsx
function calcDropIndex(
     attachedNodeChildren: BadeMind.Node[] | undefined,
     dropPosition: BadeMind.Coordinate,
     dragNode: BadeMind.Node,
     attachedNode: BadeMind.Node): number
```

- **param** **`attachedNodeChildren`** 关联节点的子代

- **param** **`dropPosition`** 拖动节点镜像中心位置

- **param** **`dragNode`** 拖动节点

- **param** **`attachedNode`** 被关联的节点

- **return** 期望插入位置
  
  - 如果**父级改变**，则为期望插入位置下标，直接插入子代中即可
  
  - 如果**父级未变**，则需要先使用下标插入到对应位置之后，删除原先的节点

#### drag

通知控制器正在执行拖动操作，计算链接信息

- **根节点不可拖拽**

```tsx
function drag(position: BadeMind.Coordinate,canBeAttachedNodes: BadeMind.Node[]): {
    orientation: "negative" | "positive", 
    attach: BadeMind.Node
} | undefined
```

- **param** **`position`** 拖动节点镜像中心位置

- **param** **`canBeAttachedNodes`** 需要搜索的可关联节点

- **return** 链接关联信息
  
  - 如没有合法的链接节点，则返回`undefined`
  
  - `orientation`代表拖拽节点链接到目标节点的相对区域
  
  - `attach`为拖拽节点依附的目标节点

#### end

通知控制器拖动操作结束

```tsx
function end(): void
```

## Types

### Options

```tsx
export interface Options {
    /**
     * 渲染方向
     * - positive 在 x 模式下渲染在右侧，y 模式下渲染在上侧
     * - negative 在 x 模式下渲染在左侧，y 模式下渲染在下侧
     * @default 'x' 水平方向
     */
    direction?: Direction
    /**
     * 节点间距
     * @default 50
     */
    nodeSeparate?: number
    /**
     * 每一级的距离
     * @default 50
     */
    rankSeparate?: number
    /**
     * 子代对齐模式(布局模式)
     * @default 'structured'
     */
    childAlignMode?: ChildAlignMode
    /**
     * 视窗四周预加载尺寸
     * @default 0
     */
    viewportPreloadPadding?: number
    /**
     * 回调
     */
    callback?: Callback
    /**
     * 事件
     */
    event?: Event
    /**
     * 连线样式风格
     * @default 'bezier'
     */
    lineStyle?: LinkStyle
    /**
     * 自定义path渲染路径
     * - 优先级高于 `lineStyle`
     * @param data
     * @return 返回字符串将作为 path d 属性
     */
    pathRender?: PathRender | undefined
    /**
     * 缩放尺度控制
     */
    zoomExtent?: ZoomExtent
    /**
     * 自定义布局处理器
     * - 优先级高于 childAlignMode 选择的布局方式
     */
    layoutProcess?: { new (): Process.Lifecycle }
}
```

### Root

根节点

- 脑图可以向左右或者上下扩展，故而需要划分`positive`、`negative`

```tsx
interface Root {
    /**
     * 根节点数据
     */
    node: Omit<Node, 'children'>
    /**
     * 正向区域节点
     */
    positive?: Node[]
    /**
     * 负向区域节点
     */
    negative?: Node[]
}
```

### Node

节点信息  

```tsx
interface Node {  
    /** 
    * 获取当前节点尺寸  
    */ 
    sizeof: () => Size 
    /** 
    * 全局唯一 id 
    */ 
    id: string  
     /**
     * 子代  
     */ 
    children?: Node[]  
    /** 
    * 是否折叠子代  
    * - 根节点为数组，[negative,positive]  
    * - 普通节点直接代表是否折叠子代  
    * @default false | [false,false] 
    */ 
    fold?: boolean | boolean[]  
    /** 
    * 附带数据  
    * - 请将节点附带的数据全部存储到此处  
    */ 
    attachData?: any  
}
```

### Basic

#### Callback

回调集合

```tsx
interface Callback {
    /**
     * 转换发生改变，通知外部
     * @param transform
     */
    onTransformChange?: (transform: Transform) => void
    /**
     * 可见节点发生了改变
     * - 每一次 `setData` 后都必定会调用此事件
     * @param nodes 可见节点数组(节点都是对`setData`中节点数据的引用，请注意根节点设置`children`无效)
     */
    onNodeVisibleChange?: (nodes: BadeMind.Node[]) => void
}
```

##### onTransformChange

通知外部`transform`相关信息发生了改变，常用于**辅助额外控制行为**，举个🌰：实现滚动条、缩放器等辅助控制

##### onNodeVisibleChange

可见节点发生改变  

- `nodes`中节点皆为`setData root`中的**数据引用**  

- 请注意对根节点的特殊处理（根节点设置`children`无效，应该设置`root`的`positive`或`negative`）

#### Event

内核事件

```tsx
interface Event {
    /**
     * 视窗上下文菜单事件
     * - 组件禁用了在视窗上的右键菜单
     * @param e
     */
    onViewportContextMenu?: (e: MouseEvent) => void
    /**
     * zoom 事件触发器
     */
    onZoomEventTrigger?: ZoomEvent
}
```

##### onViewportContextMenu

`viewport`右键上下文事件触发，可通过此事件自定义右键菜单  

- 由于右键拖动，移动脑图面板，故而库默认禁用了`viewport`的右键菜单事件  

##### onZoomEventTrigger

缩放位移相关按钮手势事件触发  

- 右键拖动、Ctrl+滚轮缩放，在这些行为下库会拦截其对应事件，导致外部无法绑定事件

#### ZoomEvent

缩放事件

```tsx
/**
* 位移/缩放事件函数
* @param event the underlying input event, such as mousemove or touchmove
*/

type ZoomEventFunc = (event: any) => void

interface ZoomEvent {
    /**
     * 缩放/拖动开始事件
     */
    start?: ZoomEventFunc
    /**
     * 缩放/拖动中事件
     */
    zoom?: ZoomEventFunc
    /**
     * 缩放/拖动结束
     */
    end?: ZoomEventFunc
}
```

#### ZoomExtent

缩放、位移边界设定

```tsx
interface ZoomExtent {
    /**
     * 位移边界
     * - 其是可视区域（viewport）在图形所在世界的边界坐标
     * - 计算时，可以简单的将 viewport 视作可移动的部分，图形保持位置不变（注意scale带来的影响，需要将viewport转换到图形所在世界坐标系,EM: viewport.width/scale)）
     * @default [[x: -∞, y: -∞], [x: +∞, y :+∞]]
     */
    translate?: [Coordinate, Coordinate]
    /**
     * 缩放边界
     * @default [0, ∞]
     */
    scale?: [number, number]
}
```

#### LinkStyle

内核预设链接风格

```tsx
type LinkStyle = "line" | "bezier"
```

- `bezier` 贝塞尔曲线链接  

![bezier.png](https://raw.githubusercontent.com/x-glorious/bade/main/docs/bezier.png)  

- `line` 线性链接  
  - 线性只有在 `ChildAlignMode.structured` 风格下表现最佳  

![line.png](https://raw.githubusercontent.com/x-glorious/bade/main/docs/line.png)

#### Size

尺寸

```tsx
interface Size {  
 width: number  
 height: number  
}
```

#### Coordinate

坐标

```tsx
interface Coordinate {  
 x: number
 y: number
}
```

#### Direction

渲染方向  

- `positive` 在 x 模式下渲染在右侧，y 模式下渲染在上侧  

- `negative` 在 x 模式下渲染在左侧，y 模式下渲染在下侧

```tsx
type Direction = 'x' | 'y'
```

- `x` 横向渲染模式  

- `y` 纵向渲染模式

#### ChildAlignMode

内核内置布局方式

```tsx
type ChildAlignMode = "heir-center" | "structured" | "descendant-center"
```

- `descendant-center` 子代对齐模式（**同一父节点的子代视作整体**对齐）  

![descendant-center.png](https://raw.githubusercontent.com/x-glorious/bade/main/docs/descendant-center.png)  

- `heir-center` 直系子代对齐模式（**同一父节点直系子代**对齐）  

![heir-center.png](https://raw.githubusercontent.com/x-glorious/bade/main/docs/heir-center.png)  

- `structured` 结构化规整模式（同一父节点直系子代**边缘对齐**）  

![structured.png](https://raw.githubusercontent.com/x-glorious/bade/main/docs/structured.png)

#### Transform

渲染区域位移缩放转化信息

```tsx
interface Transform {
    x: number
    y: number
    scale: number
}
```

#### Relative

相对位置

```tsx
type RelativeX = "middle" | "left" | "right"


type RelativeY = "middle" | "top" | "bottom"


interface Relative {
    x: RelativeX
    y: RelativeY
}
```

### Advanced

#### PathRender

自定义路径渲染器，其返回值将作为链接线`path`的`d`属性值

- [d - SVG | MDN](https://developer.mozilla.org/zh-CN/docs/Web/SVG/Attribute/d)

```tsx
type PathRender = (context: PathRenderContext) => string
```

🌰：把所有节点用直线链接起来  

```tsx
const linePathRender: PathRender = (context) => {  
 const { source, target } = context  
 return `M${source.x},${source.y}L${target.x},${target.y}`  
}  
```

![custom-line-render.png](https://raw.githubusercontent.com/x-glorious/bade/main/docs/custom-line-render.png)

##### PathRenderContext

```tsx
interface PathData extends Line {
    /**
     * 节点自身数据
     */
    node: Node
}

interface PathRenderContext extends PathData {
    /**
     * 设定
     */
    options: Required<Options>
    /**
     * 缓存地图
     */
    cacheMap: CacheMap
} 
```

#### Line

连线信息

```tsx
interface Line {
    /**
     * 链接线起点（节点父级）
     */
    source: Coordinate
    /**
     * 连接线终点（节点自身）
     */
    target: Coordinate
}
```

#### Orientation

节点与根节点之间的位置关系

```tsx
type Orientation = "negative" | "root" | "positive"
```

- `negative` 节点位于根负向区域  

- `positive` 节点位于根正向区域  

- `root` 节点为根节点

#### Visible

节点可见信息

```tsx
interface Visible {
    /**
     * 节点本身是否可见
     */
    node: boolean
    /**
     * 与父级之间的连线
     */
    lineAttachParent: boolean
}
```

#### CacheMap

内核缓存信息

```tsx
type CacheMap = Map<string, NodeCache>
```

#### NodeCache

节点缓存信息

```tsx
interface NodeCache {
    /**
     * 节点方位
     */
    orientation: Orientation
    /**
     * 节点数据
     */
    node: Node
    /**
     * 节点所属矩形大小以及位置
     */
    rect: Size & Coordinate
    /**
     * 是否可见
     */
    visible: Visible
    /**
     * 父级节点
     */
    parent?: Node
    /**
     * 处理器在处理时的缓存数据
     */
    processCache: any
    /**
     * 连线相关信息
     */
    line: Line
    /**
     * 整体布局尺寸
     * - 只有根节点保存此数据
     */
    layoutSize?: Size
}
```

#### DraggableLayout

可拖拽布局类

- `layoutProcess` 需要**继承此类**，并且实现`calcDragAttach`、`calcDropIndex` 静态方法才可正常使用拖拽功能

```tsx
class DraggableLayout {
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
    cacheMap: CacheMap
    draggingRect: Coordinate & Size
    canBeAttachedNodes: Node[]
    ignoreNodes: Node[]
    root: Root
    options: Required<Options>
  }): DragAttach | undefined => {
    ...
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
    cacheMap: CacheMap
    attachedNodeChildren: Node[] | undefined
    dropPosition: Coordinate
    attachedNode: Node
    dragNode: Node
    root: Root
    options: Options
  }): number => {
    ...
  }

  /**
   * 是否为合法的继承了这个类的类对象
   * @param classObject
   */
  public static isValidExtendsClass = (classObject: any) => {
    ...
  }
}
```

#### Process

处理器为拓展自定义功能

##### Lifecycle

```tsx
interface Lifecycle<S = void, E = void, AE = void, END = void> {
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
```

##### StartContext

开始处理节点之前的上下文

```tsx
interface StartContext {
    /**
     * 配置项
     */
    options: Required<Options>
    /**
     * 根数据
     */
    root: Root
    /**
     * 获取根直系子代的方位
     * @param id 直系子代 id
     */
    getRootHeirOrientation: (id: string) => Orientation
    /**
     * 缓存地图
     */
    cacheMap: CacheMap
    /**
     * 上一次的缓存地图
     */
    preCacheMap?: CacheMap
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
    transform: Transform
    /**
     * 配置锚点
     */
    anchor?: string
    /**
     * 位移/缩放控制器
     */
    zoom: Zoom
}
```

##### EveryContext

处理每一个节点的上下文

```tsx
interface EveryContext {
    /**
     * 当前处理节点缓存信息
     */
    cache: NodeCache
    /**
     * 是否折叠子代
     * - 根节点为数组，[negative,positive]
     * - 普通节点直接代表是否折叠子代
     * @default false | [false,false]
     */
    fold?: boolean | boolean[]
}
```
