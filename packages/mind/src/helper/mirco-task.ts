export const mircoTask = (task: () => void) => {
  Promise.resolve().then(task)
}
