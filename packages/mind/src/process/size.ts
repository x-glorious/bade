import { Process } from './index'

export class Size implements Process.Lifecycle {
  every = (context: Process.EveryContext) => {
    const { cache } = context
    const size = cache.node.sizeof()
    cache.rect.width = size.width
    cache.rect.height = size.height
  }
}
