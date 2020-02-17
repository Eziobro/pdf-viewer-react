export function debounce (func, wait, immediate) {

    var timeout, result

    return function () {
        var context = this
        var args = arguments

        if (timeout) clearTimeout(timeout)
        if (immediate) {
            // 如果已经执行过，不再执行
            var callNow = !timeout
            timeout = setTimeout(function () {
                timeout = null
            }, wait)
            if (callNow) result = func.apply(context, args)
        } else {
            timeout = setTimeout(function () {
                func.apply(context, args)
            }, wait)
        }
        return result
    }
}

export function throttle (func, wait) {
    var timeout, context, args, result
    var previous = 0

    var later = function () {
        previous = +new Date()
        timeout = null
        func.apply(context, args)
    }

    var throttled = function () {
        var now = +new Date()
        //下次触发 func 剩余的时间
        var remaining = wait - (now - previous)
        context = this
        args = arguments
        // 如果没有剩余的时间了或者你改了系统时间
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout)
                timeout = null
            }
            previous = now
            func.apply(context, args)
        } else if (!timeout) {
            timeout = setTimeout(later, remaining)
        }
    }
    return throttled
}

export function getPixelRatio (context) {
    const backingStore =
      context.backingStorePixelRatio ||
      context.webkitBackingStorePixelRatio ||
      context.mozBackingStorePixelRatio ||
      context.msBackingStorePixelRatio ||
      context.oBackingStorePixelRatio ||
      context.backingStorePixelRatio ||
      1
    return (window.devicePixelRatio || 1) / backingStore
}

export const ENUM = {
    marginTop: 20,
    marginLeft: 120,
}

export const DIRECTION = {
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
    TOP: 'TOP',
    BOTTOM: 'BOTTOM'
}
