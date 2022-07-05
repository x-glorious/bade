const {
  _Process: Process,
  _Helper: Helper,
  _WithDefault: WithDefault
} = require('../../lib').BadeMind

const exec = (root, processes, callback) => {
  const cacheMap = new Map()
  const options = callback.options ? callback.options(WithDefault.options()) : WithDefault.options()

  const { shadowNode, getRootHeirOrientation } = Helper.transformRootToWalkable(root)

  processes.forEach(
    (item) =>
      item.start &&
      item.start({
        cacheMap,
        getRootHeirOrientation,
        options,
        root
      })
  )

  // 深度遍历树
  Helper.depthFirstWalkTree(shadowNode, {
    after: (node) => {
      const context = callback.afterEvery
        ? callback.afterEvery({
          cache: cacheMap.get(node.id)
          })
        : {
          cache: cacheMap.get(node.id)
        }
      // 依次执行处理器
      processes.forEach((item) => item.afterEvery && item.afterEvery(context))
    },
    before: (node, parent) => {
      const cache = WithDefault.cache()
      // 缓存信息
      cacheMap.set(node.id, cache)
      cache.node = node
      cache.parent = parent

      const context = callback.every
        ? callback.every({
          cache
          })
        : {
          cache
        }

      // 依次执行处理器
      processes.forEach((item) => item.every && item.every(context))

      // 如果节点被折叠，则，其子代不纳入后续处理
      return !node.fold
    }
  })

  processes.forEach((item) => item.end && item.end())

  return cacheMap
}

module.exports = {
  exec
}
