const { _Process: Process } = require('../../lib').BadeMind
const { baseRoot } = require('../mock')
const { exec } = require('./exec')

test('Heir center layout process x', () => {
  const nodeSeparate = 10
  const rankSeparate = 20
  const processes = [new Process.Orientation(), new Process.HeirCenterLayout()]
  const cacheMap = exec(baseRoot, processes, {
    every: (context) => {
      context.cache.rect.width = context.cache.node.size.width
      context.cache.rect.height = context.cache.node.size.height
      return context
    },
    options: (options) => {
      options.nodeSeparate = nodeSeparate
      options.rankSeparate = rankSeparate
      return options
    }
  })

  // 检测 rankSeparate 有效性
  expect(
    cacheMap.get('p-2-leaf-double').rect.x -
      cacheMap.get('root').rect.x -
      cacheMap.get('root').rect.width / 2 -
      cacheMap.get('p-2-leaf-double').rect.width / 2
  ).toBe(rankSeparate)
  // 检测方位渲染正确性
  expect(
    cacheMap.get('n-2-leaf-double').rect.x -
      cacheMap.get('root').rect.x +
      cacheMap.get('n-2-leaf-double').rect.width / 2 +
      cacheMap.get('root').rect.width / 2
  ).toBe(-rankSeparate)
  // 检测nodeSeparate正确性
  expect(
    cacheMap.get('p-2-leaf').rect.y -
      cacheMap.get('p-2-leaf-double').rect.y +
      cacheMap.get('p-2-leaf').rect.height / 2 +
      cacheMap.get('p-2-leaf-double').rect.height / 2
  ).toBe(-nodeSeparate)
  // 检查对齐算法正确性
  expect(cacheMap.get('p-2-leaf').rect.x).toBe(cacheMap.get('p-2-with-children').rect.x)
  expect(cacheMap.get('p-2-leaf').rect.x).toBe(cacheMap.get('p-2-leaf-double').rect.x)
})

test('Heir center layout process y', () => {
  const nodeSeparate = 10
  const rankSeparate = 20
  const processes = [new Process.Orientation(), new Process.HeirCenterLayout()]
  const cacheMap = exec(baseRoot, processes, {
    every: (context) => {
      context.cache.rect.width = context.cache.node.size.width
      context.cache.rect.height = context.cache.node.size.height
      return context
    },
    options: (options) => {
      options.nodeSeparate = nodeSeparate
      options.rankSeparate = rankSeparate
      options.direction = 'y'
      return options
    }
  })

  // 检测 rankSeparate 有效性
  expect(
    cacheMap.get('p-2-leaf-double').rect.y -
      cacheMap.get('root').rect.y +
      cacheMap.get('root').rect.height / 2 +
      cacheMap.get('p-2-leaf-double').rect.height / 2
  ).toBe(-rankSeparate)
  // 检测方位渲染正确性
  expect(
    cacheMap.get('n-2-leaf-double').rect.y -
      cacheMap.get('root').rect.y -
      cacheMap.get('n-2-leaf-double').rect.height / 2 -
      cacheMap.get('root').rect.height / 2
  ).toBe(rankSeparate)
  // 检测nodeSeparate正确性
  expect(
    cacheMap.get('p-2-leaf').rect.x -
      cacheMap.get('p-2-leaf-double').rect.x +
      cacheMap.get('p-2-leaf').rect.width / 2 +
      cacheMap.get('p-2-leaf-double').rect.width / 2
  ).toBe(-nodeSeparate)
  // // 检查对齐算法正确性
  expect(cacheMap.get('p-2-leaf').rect.y).toBe(cacheMap.get('p-2-with-children').rect.y)
  expect(cacheMap.get('p-2-leaf').rect.y).toBe(cacheMap.get('p-2-leaf-double').rect.y)
})

test('Descendant center layout process x', () => {
  const nodeSeparate = 10
  const rankSeparate = 20
  const processes = [new Process.Orientation(), new Process.DescendantCenterLayout()]
  const cacheMap = exec(baseRoot, processes, {
    every: (context) => {
      context.cache.rect.width = context.cache.node.size.width
      context.cache.rect.height = context.cache.node.size.height
      return context
    },
    options: (options) => {
      options.nodeSeparate = nodeSeparate
      options.rankSeparate = rankSeparate
      return options
    }
  })

  // 验证布局算法可靠性
  expect(cacheMap.get('p-2-leaf').rect.x).toBe(
    (cacheMap.get('p-3-leaf').rect.x + cacheMap.get('p-2-with-children').rect.x) / 2
  )
  expect(cacheMap.get('p-2-leaf-double').rect.x).toBe(
    (cacheMap.get('p-3-leaf').rect.x + cacheMap.get('p-2-with-children').rect.x) / 2
  )
  expect(cacheMap.get('n-2-leaf').rect.x).toBe(
    (cacheMap.get('n-3-leaf').rect.x + cacheMap.get('n-2-with-children').rect.x) / 2
  )
  expect(cacheMap.get('n-2-leaf-double').rect.x).toBe(
    (cacheMap.get('n-3-leaf').rect.x + cacheMap.get('n-2-with-children').rect.x) / 2
  )
  // 检测 rankSeparate 有效性
  expect(
    cacheMap.get('p-2-with-children').rect.x -
      cacheMap.get('root').rect.x -
      cacheMap.get('root').rect.width / 2 -
      cacheMap.get('p-2-with-children').rect.width / 2
  ).toBe(rankSeparate)
  // 检测nodeSeparate正确性
  expect(
    cacheMap.get('p-2-leaf').rect.y -
      cacheMap.get('p-2-leaf-double').rect.y +
      cacheMap.get('p-2-leaf').rect.height / 2 +
      cacheMap.get('p-2-leaf-double').rect.height / 2
  ).toBe(-nodeSeparate)
})

test('Descendant center layout process y', () => {
  const nodeSeparate = 10
  const rankSeparate = 20
  const processes = [new Process.Orientation(), new Process.DescendantCenterLayout()]
  const cacheMap = exec(baseRoot, processes, {
    every: (context) => {
      context.cache.rect.width = context.cache.node.size.width
      context.cache.rect.height = context.cache.node.size.height
      return context
    },
    options: (options) => {
      options.nodeSeparate = nodeSeparate
      options.rankSeparate = rankSeparate
      options.direction = 'y'
      return options
    }
  })

  // 验证布局算法可靠性
  expect(cacheMap.get('p-2-leaf').rect.y).toBe(
    (cacheMap.get('p-3-leaf').rect.y + cacheMap.get('p-2-with-children').rect.y) / 2
  )
  expect(cacheMap.get('p-2-leaf-double').rect.y).toBe(
    (cacheMap.get('p-3-leaf').rect.y + cacheMap.get('p-2-with-children').rect.y) / 2
  )
  expect(cacheMap.get('n-2-leaf').rect.y).toBe(
    (cacheMap.get('n-3-leaf').rect.y + cacheMap.get('n-2-with-children').rect.y) / 2
  )
  expect(cacheMap.get('n-2-leaf-double').rect.y).toBe(
    (cacheMap.get('n-3-leaf').rect.y + cacheMap.get('n-2-with-children').rect.y) / 2
  )
  // 检测 rankSeparate 有效性
  expect(
    cacheMap.get('p-2-with-children').rect.y -
      cacheMap.get('root').rect.y +
      cacheMap.get('root').rect.height / 2 +
      cacheMap.get('p-2-with-children').rect.height / 2
  ).toBe(-rankSeparate)
  // 检测nodeSeparate正确性
  expect(
    cacheMap.get('p-2-leaf').rect.x -
      cacheMap.get('p-2-leaf-double').rect.x +
      cacheMap.get('p-2-leaf').rect.width / 2 +
      cacheMap.get('p-2-leaf-double').rect.width / 2
  ).toBe(-nodeSeparate)
})
