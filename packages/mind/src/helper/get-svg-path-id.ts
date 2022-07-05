import { withPrefix } from './with-prefix'

export const getSvgPathId = (id: string) => withPrefix(`line-${id}`)
