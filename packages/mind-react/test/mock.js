// 虚拟节点信息
const baseRoot = {
  negative: [
    {
      attachData: 'n-2 leaf some placeholder placeholder\ndgsauhdgsahg',
      children: [],
      id: 'n-2-leaf-long-long'
    },
    {
      attachData: 'n-2 leaf',
      id: 'n-2-leaf'
    },
    {
      attachData: 'n-2 with children',
      children: [
        {
          attachData: 'n-3 leaf',
          id: 'n-3-leaf'
        }
      ],
      id: 'n-2-with-children'
    }
  ],
  node: {
    attachData: 'Root',
    id: 'root'
  },
  positive: [
    {
      attachData: 'p-2 leaf',
      children: [],
      id: 'p-2-leaf'
    },
    {
      attachData: 'p-2 leaf some placeholder placeholder',
      children: [],
      id: 'p-2-leaf-long-long'
    },
    {
      attachData: 'p-2 with children',
      children: [
        {
          attachData: 'p-3 leaf',
          id: 'p-3-leaf'
        }
      ],
      id: 'p-2-with-children'
    }
  ]
}

module.exports = {
  baseRoot
}
