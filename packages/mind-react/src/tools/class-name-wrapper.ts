import Classnames from 'classnames'

export const classNameWrapper = (style: Record<string, Classnames.Value>, name: string) => {
  // 添加 global class
  return Classnames(style[name], `mind-react__${name}`)
}
