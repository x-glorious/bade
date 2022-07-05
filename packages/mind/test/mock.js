// 虚拟节点信息
const baseRoot = {
  negative: [
    {
      children: [],
      getSize: () => ({
        height: 100,
        width: 200
      }),
      id: 'n-2-leaf-double'
    },
    {
      getSize: () => ({
        height: 50,
        width: 100
      }),
      id: 'n-2-leaf'
    },
    {
      children: [
        {
          getSize: () => ({
            height: 50,
            width: 100
          }),
          id: 'n-3-leaf'
        }
      ],
      getSize: () => ({
        height: 50,
        width: 100
      }),
      id: 'n-2-with-children'
    }
  ],
  node: {
    getSize: () => ({
      height: 50,
      width: 100
    }),
    id: 'root'
  },
  positive: [
    {
      children: [],
      getSize: () => ({
        height: 50,
        width: 100
      }),
      id: 'p-2-leaf'
    },
    {
      children: [],
      getSize: () => ({
        height: 100,
        width: 200
      }),
      id: 'p-2-leaf-double'
    },
    {
      children: [
        {
          getSize: () => ({
            height: 50,
            width: 100
          }),
          id: 'p-3-leaf'
        }
      ],
      getSize: () => ({
        height: 50,
        width: 100
      }),
      id: 'p-2-with-children'
    }
  ]
}

module.exports = {
  baseRoot
}
