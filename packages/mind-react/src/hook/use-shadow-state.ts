import { useCallback, useRef, useState } from 'react'

export const useShadowState = <T>(init?: T) => {
  const [state, setState] = useState<T>(init as any)
  const shadow = useRef<T>(state)

  const setStateWrapper = useCallback(
    (update: T | ((prevState: T) => T)) => {
      let result = update as T
      if (typeof update === 'function') {
        result = (update as any)(shadow.current)
      }

      shadow.current = result
      setState(result)
    },
    /* eslint-disable-next-line */
    []
  )

  return [state, setStateWrapper, shadow] as const
}
