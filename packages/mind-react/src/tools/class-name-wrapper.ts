import Classnames from 'classnames'

export const classNameWrapper = <S>(style: S, name: keyof S) => {
  return Classnames(style[name], `bade-mind-react__${name}`)
}
