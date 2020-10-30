import { on, off } from './index'

interface InternalHook {
  startInternal: () => void
  stopInternal: () => void
}

export const useInternal = (ms: number, cb: () => void): InternalHook => {
  let t: NodeJS.Timeout
  let running = false
  const startInternal = () => {
    if (running) {
      return console.error(
        'The timer has started, use stopInternal to stop the timer'
      )
    }
    running = true
    t = setInterval(cb, ms)
  }
  const stopInternal = () => {
    running = false
    t && clearInterval(t)
  }
  return {
    startInternal,
    stopInternal
  }
}

export const dragHook = (container: HTMLElement, target: HTMLElement) => {
  // const boxClient = {
  //   w: document.documentElement.offsetWidth,
  //   h: document.documentElement.offsetHeight
  // }

  const cache = {
    x: 0,
    y: 0
  }

  // const containerClient = {
  //   grapX: container.offsetLeft,
  //   grapY: container.offsetTop,
  //   w: container.offsetWidth,
  //   h: container.offsetHeight
  // }

  let clickPosition: {
    x: number
    y: number
  } = {
    x: 0,
    y: 0
  }

  let canMove = false

  const mousedown = (e: MouseEvent) => {
    canMove = true
    const { clientX, clientY } = e
    clickPosition = {
      x: clientX,
      y: clientY
    }
    target.style.cursor = 'grabbing'
  }
  const mouseup = () => {
    canMove = false
    const matrix = window.getComputedStyle(container).transform.match(/-?\d+/g)
    if (matrix) {
      cache.x = +matrix[4]
      cache.y = +matrix[5]
    }
    target.style.cursor = 'grab'
  }
  const mousemove = (e: MouseEvent) => {
    if (canMove) {
      const { clientX, clientY } = e
      const left = clientX - clickPosition.x + cache.x
      const top = clientY - clickPosition.y + cache.y
      requestAnimationFrame(() => {
        container.style.transform = `matrix(1, 0, 0, 1, ${left}, ${top}) translateZ(0)`
      })
      // if (left >= 0 && left + containerClient.w <= boxClient.w) {

      // }
      // if (top >= 0 && top + containerClient.h <= boxClient.h) {
      //   requestAnimationFrame(() => {
      //     cache.y = top
      //     container.style.transform = `matrix(1, 0, 0, 1, ${cache.x}, ${cache.y})`
      //   })
      // }
    }
  }

  const stop = () => {
    off(container, 'mousedown', mousedown)
    off(document.documentElement, 'mouseup', mouseup)
    off(document.documentElement, 'mousemove', mousemove)
  }

  const start = () => {
    on(container, 'mousedown', mousedown)
    on(document.documentElement, 'mouseup', mouseup)
    on(document.documentElement, 'mousemove', mousemove)
  }

  start()

  return {
    start,
    stop
  }
}