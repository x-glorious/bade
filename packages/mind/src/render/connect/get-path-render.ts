import { BadeMind } from '../../index'
import { bezier } from './bezier'
import { line } from './line'

export const getPathRender = (options: Required<BadeMind.Options>) => {
  const { pathRender, lineStyle } = options
  if (pathRender) {
    return pathRender
  } else {
    const styleMap = {
      [BadeMind.LinkStyle.line]: line,
      [BadeMind.LinkStyle.bezier]: bezier
    }
    return styleMap[lineStyle]
  }
}
