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

export const ENUM = {
    marginTop: 20,
    marginLeft: 40,
}
