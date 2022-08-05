import { Mind } from '../../index'
import { bezier } from './bezier'
import { line } from './line'

export const getPathRender = (options: Required<Mind.Options>) => {
  const { pathRender, lineStyle } = options
  if (pathRender) {
    return pathRender
  } else {
    const styleMap = {
      [Mind.LinkStyle.line]: line,
      [Mind.LinkStyle.bezier]: bezier
    }
    return styleMap[lineStyle]
  }
}
