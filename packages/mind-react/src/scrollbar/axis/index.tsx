import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Classnames from 'classnames'

import { classNameWrapper } from '../../tools/class-name-wrapper'

// @ts-ignore-next-line
import Style from './index.module.scss'

interface AxisProps {
  /**
   * value最大数值
   */
  total: number
  /**
   * 滑块所占长度(可视区域尺寸，滚动条真实尺寸)
   */
  thumb: number
  /**
   * 当前值
   */
  value: number
  /**
   * 滚动位置改变事件
   * @param percentage 滚动比例
   */
  onChange: (percentage: number) => void
  /**
   * 是否是垂直坐标
   */
  vertical: boolean
}

export const Axis = (props: AxisProps) => {
  const { total, thumb, value, onChange, vertical } = props
  const containerRef = useRef<HTMLDivElement | null>(null)
  // 滑块容器尺度
  // 因为滑块滑到底的时候，实际上还占有了一定区域
  const withThumbTotal = useMemo(() => total + thumb, [total, thumb])
  // 滑块屏幕尺寸（已经缩放转换，为真实屏幕尺寸）
  const thumbSize = useMemo(() => (thumb * thumb) / withThumbTotal, [thumb, withThumbTotal])
  // 移动距离屏幕尺寸（已经缩放转换，为真实屏幕尺寸））
  const moveDistance = useMemo(
    () => (value * thumb) / withThumbTotal,
    [value, thumb, withThumbTotal]
  )
  // 鼠标是否按下
  const [isMouseDown, setIsMouseDown] = useState(false)
  // 开始位移时的位置
  const startMovePosition = useRef<{
    relative: number
    absolute: number
  }>()

  const thumbStyle = useMemo<React.CSSProperties>(() => {
    const result: React.CSSProperties = {}

    if (vertical) {
      result.height = `${thumbSize}px`
      result.transform = `translateY(${moveDistance}px)`
    } else {
      result.width = `${thumbSize}px`
      result.transform = `translateX(${moveDistance}px)`
    }

    return result
  }, [thumbSize, moveDistance, vertical])

  const onChangeDispose = useCallback(
    (screenPercentage: number) => {
      // 限定范围
      if (screenPercentage < 0) {
        screenPercentage = 0
      } else if (screenPercentage > 1 - thumbSize / thumb) {
        screenPercentage = 1 - thumbSize / thumb
      }

      // 得出虚拟尺寸
      // 计算位移比例
      onChange((screenPercentage * withThumbTotal) / total)
    },
    [onChange, total, withThumbTotal]
  )

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      // 避免拖动事件干扰
      if (e.target === containerRef.current) {
        let diff: number = 0
        // 计算比例，滑块居中处理
        if (vertical) {
          // 计算比例，滑块居中处理
          diff = (e.nativeEvent.offsetY - thumbSize / 2) / thumb
        } else {
          diff = (e.nativeEvent.offsetX - thumbSize / 2) / thumb
        }

        onChangeDispose(diff)
      }
      e.stopPropagation()
    },
    [thumb, thumbSize, onChangeDispose]
  )

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isMouseDown) {
        return
      }

      if (!startMovePosition.current) {
        startMovePosition.current = {
          absolute: 0,
          relative: 0
        }
        startMovePosition.current.relative = moveDistance
        if (vertical) {
          startMovePosition.current.absolute = e.clientY
        } else {
          startMovePosition.current.absolute = e.clientX
        }
      }

      let absolute = 0
      if (vertical) {
        absolute = e.clientY
      } else {
        absolute = e.clientX
      }
      const diff = absolute - startMovePosition.current.absolute
      const result = diff + startMovePosition.current.relative

      onChangeDispose(result / thumb)
      e.stopPropagation()
    },
    [onChangeDispose, isMouseDown, moveDistance, vertical, thumb]
  )
  // 全局监听 move 事件
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [onMouseMove])

  // 全局监听鼠标松开事件
  useEffect(() => {
    const onMouseUp = (e) => {
      setIsMouseDown(false)
      startMovePosition.current = undefined
      e.stopPropagation()
    }
    window.addEventListener('mouseup', onMouseUp)
    return () => window.removeEventListener('mouseup', onMouseUp)
  }, [setIsMouseDown])

  return (
    <div
      className={Classnames(
        classNameWrapper(Style, 'axis'),
        classNameWrapper(Style, vertical ? 'axis--y' : 'axis--x'),
        isMouseDown ? classNameWrapper(Style, 'axis--active') : ''
      )}
      onClick={onClick}
      ref={containerRef}
    >
      <div
        className={classNameWrapper(Style, 'thumb')}
        style={thumbStyle}
        onMouseDown={(e) => {
          setIsMouseDown(true)
          // 禁用默认（防止选中文字）
          e.preventDefault()
          e.stopPropagation()
          return false
        }}
      />
    </div>
  )
}
