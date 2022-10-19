import Classnames from 'classnames'

export const classNameWrapper = <S>(style: S, name: keyof S) => {
  // 添加 global class
  return Classnames(style[name] as any, `mind-react__${name}`)
}
