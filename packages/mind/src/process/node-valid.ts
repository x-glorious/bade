import { Helper } from '../helper'
import { BadeMind } from '../index'
import { Process } from './index'

export class NodeValid implements Process.Lifecycle {
  private root: BadeMind.Root

  start = (context: Process.StartContext) => {
    const { root } = context
    this.root = root
  }

  every = (context: Process.EveryContext) => {
    const {
      cache: { node }
    } = context

    if (!node.id) {
      throw Helper.error('node id can not be empty or undefined')
    }

    if (!node.sizeof) {
      throw Helper.error('node sizeof function can not be undefined')
    }

    if (this.root.node.id === node.id) {
      if (typeof node.fold !== 'undefined' && typeof node.fold !== 'object') {
        throw Helper.error('root node fold should be undefined or array')
      }
    } else {
      if (typeof node.fold !== 'undefined' && typeof node.fold !== 'boolean') {
        throw Helper.error('normal node fold should be undefined or boolean')
      }
    }
  }
}
