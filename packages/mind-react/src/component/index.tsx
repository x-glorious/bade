import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'

import { Mind } from 'bade-mind'
import Classnames from 'classnames'

import { MindReact } from '../'
import { Scrollbar } from '../scrollbar'
import { classNameWrapper } from '../tools/class-name-wrapper'
import { Nodes } from './nodes'

// @ts-ignore-next-line
import Style from './index.module.scss'

export const View = forwardRef(
  (props: MindReact.ViewProps, ref: React.Ref<MindReact.GraphicRef>) => {
    const {
      className,
      style,
      options: settingOptions,
      data,
      anchor,
      render,
      onUpdated,
      scrollbar,
      wheelMoveSpeed = 0.5,
      onDragEnd,
      onDragStart,
      onDrag
    } = props

    const [mind, setMind] = useState<Mind.Graphic | undefined>()
    const [viewport, setViewport] = useState<HTMLElement | null>()
    const [container, setContainer] = useState<HTMLElement | null>()
    const [transform, setTransform] = useState<Mind.Transform | undefined>()
    const [isInDragMove, setIsInDragMove] = useState(false)
    const [renderChangeToggle, setRenderChangeToggle] = useState(0)
    // 脑图更新事件引用
    const onUpdatedRef = useRef<typeof onUpdated>(onUpdated)

    useImperativeHandle(
      ref,
      () => ({
        mind
      }),
      [mind]
    )

    // 同步事件
    useEffect(() => {
      onUpdatedRef.current = onUpdated
    }, [onUpdated])

    // 组件销毁，脑图注销事件绑定
    useEffect(() => {
      return () => {
        mind && mind.unbind()
      }
    }, [mind])

    // transform 值变化事件
    const onTransformChange = useCallback((transform: Mind.Transform) => {
      setTransform((pre) => {
        if (transform.x === pre?.x && transform.y === pre?.y && transform.scale === pre?.scale) {
          return pre
        } else {
          return { ...transform }
        }
      })
    }, [])

    // 可视节点变化事件
    const onNodeVisibleChange = useCallback((_nodes: Mind.Node[]) => {
      // 可渲染节点变化，引起node内容重渲染
      setRenderChangeToggle((pre) => pre + 1)
    }, [])

    const onZoomStart = useCallback((e) => {
      if (e && e.type === 'mousedown') {
        setIsInDragMove(true)
      }
    }, [])

    const onZoomEnd = useCallback((e) => {
      if (e && e.type === 'mouseup') {
        setIsInDragMove(false)
      }
    }, [])

    const options = useMemo<Mind.Options>(() => {
      // 展开，防止修改源数据
      const wrapper: Mind.Options = { ...(settingOptions || {}) }
      wrapper.callback = { ...(wrapper.callback || {}) }
      wrapper.event = { ...(wrapper.event || {}) }

      const {
        onZoomEventTrigger: { start: startOutside, zoom: zoomOutside, end: endOutside } = {}
      } = wrapper.event
      const {
        onTransformChange: onTransformChangeOutside,
        onNodeVisibleChange: onNodeVisibleChangeOutside
      } = wrapper.callback
      // 包裹事件处理
      wrapper.callback.onTransformChange = (t) => {
        onTransformChange(t)
        onTransformChangeOutside && onTransformChangeOutside(t)
      }
      wrapper.callback.onNodeVisibleChange = (n) => {
        onNodeVisibleChange(n)
        onNodeVisibleChangeOutside && onNodeVisibleChangeOutside(n)
      }

      // 注入 zoom 事件触发器
      // 因为 zoom 相关手势会被立刻 stopImmediatePropagation，故而外部无法通过事件注册监听到
      wrapper.event.onZoomEventTrigger = {
        end: (e) => {
          endOutside && endOutside(e)
          onZoomEnd(e)
        },
        start: (e) => {
          startOutside && startOutside(e)
          onZoomStart(e)
        },
        zoom: (e) => zoomOutside && zoomOutside(e)
      }
      return wrapper
    }, [settingOptions, onTransformChange, onNodeVisibleChange, onZoomStart, onZoomEnd])

    // 获取到对应dom，初始化mind
    useEffect(() => {
      if (viewport && container) {
        setMind(new Mind.Graphic(viewport, container))
      }
    }, [viewport, container])

    // 同步 anchor
    useEffect(() => {
      if (mind) {
        mind.setAnchor(anchor)
      }
    }, [mind, anchor])

    // 同步 data,options(引动重渲染)
    useEffect(() => {
      if (mind && data) {
        mind.setOptions(options)
        // 启动重新渲染操作
        mind.setData(data as Mind.Root)
        // 通知外部，数据更新已经完成
        onUpdatedRef.current && onUpdatedRef.current(mind)
      }
    }, [mind, data, options])

    useEffect(() => {
      // 重布局计算
      mind?.refresh()
    }, [render])

    useEffect(() => {
      if (viewport) {
        const callback = (event: WheelEvent) => {
          // 禁止默认事件（右滑快捷返回）
          event.preventDefault()

          if (mind) {
            mind.translate({
              x: -event.deltaX * wheelMoveSpeed,
              y: -event.deltaY * wheelMoveSpeed
            })
          }
        }
        viewport.addEventListener('wheel', callback, {
          passive: false
        })

        return () => viewport.removeEventListener('wheel', callback)
      }
    }, [viewport, mind, wheelMoveSpeed])

    return (
      <div className={Classnames(classNameWrapper(Style, 'root'), className)}>
        <div
          className={Classnames(classNameWrapper(Style, 'viewport'), {
            [classNameWrapper(Style, 'viewport--drag-move')]: isInDragMove
          })}
          style={style}
          ref={setViewport}
        >
          <div className={classNameWrapper(Style, 'container')} ref={setContainer}>
            <Nodes
              mind={mind}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onDrag={onDrag}
              data={data}
              render={render}
              renderChangeToggle={renderChangeToggle}
            />
          </div>
        </div>
        {scrollbar && (
          <Scrollbar
            viewport={viewport}
            container={container}
            mind={mind}
            transform={transform}
            options={options}
          />
        )}
      </div>
    )
  }
)

View.displayName = 'MindReact.View'
