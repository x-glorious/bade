import { breadthFirstWalkTree } from './breadth-first-walk-tree'
import { depthFirstWalkTree } from './depth-first-walk-tree'
import { descendant } from './descendant'
import { error } from './error'
import { getLayoutCalcChildren } from './get-layout-calc-children'
import { getSvgPathId } from './get-svg-path-id'
import { judgeIfAllChildFold } from './judge-if-all-child-fold'
import { judgeIfHeirAndFold } from './judge-if-heir-and-fold'
import { judgeIfVisualLeaf } from './judge-if-visual-leaf'
import { mircoTask } from './mirco-task'
import { rootToNodeArray } from './root-to-node-array'
import { transformRootToWalkable } from './transform-root-to-walkable'
import { withPrefix } from './with-prefix'

export const Helper = {
  breadthFirstWalkTree,
  depthFirstWalkTree,
  descendant,
  error,
  getLayoutCalcChildren,
  getSvgPathId,
  judgeIfAllChildFold,
  judgeIfHeirAndFold,
  judgeIfVisualLeaf,
  mircoTask,
  rootToNodeArray,
  transformRootToWalkable,
  withPrefix
}
