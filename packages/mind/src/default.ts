import { merge } from 'lodash'

import { BadeMind } from './index'

// 函数式动态生成默认值，防止 value 为对象时的重复引用

const generateOptions = (): BadeMind.Options => ({
  callback: {
    onNodeVisibleChange: (_n) => {},
    onTransformChange: (_t) => {}
  },
  childAlignMode: BadeMind.ChildAlignMode.structured,
  direction: BadeMind.Direction.x,
  event: {
    onViewportContextMenu: (_e) => {},
    onZoomEventTrigger: {
      end: (_e) => {},
      start: (_e) => {},
      zoom: (_e) => {}
    }
  },
  lineStyle: BadeMind.LinkStyle.bezier,
  nodeSeparate: 50,
  rankSeparate: 50,
  viewportPreloadPadding: 0,
  zoomExtent: {}
})

const generateCache = (): BadeMind.NodeCache => ({
  line: {
    source: { x: 0, y: 0 },
    target: { x: 0, y: 0 }
  },
  node: {} as BadeMind.Node,
  orientation: BadeMind.Orientation.root,
  processCache: {},
  rect: { height: 0, width: 0, x: 0, y: 0 },
  visible: {
    lineAttachParent: true,
    node: true
  }
})

const generateTransform = (): BadeMind.Transform => ({
  scale: 1,
  x: 0,
  y: 0
})

const withDefaultBuilder =
  <T>(defaultData: () => T) =>
  /* eslint-disable */
    (data?: T): Required<T> => {
      if(data){
        return merge(defaultData(),data ) as any
      }else{
        return defaultData() as any
      }
    }
/* eslint-enable */

export const WithDefault = {
  cache: withDefaultBuilder(generateCache),
  options: withDefaultBuilder(generateOptions),
  transform: withDefaultBuilder(generateTransform)
}
