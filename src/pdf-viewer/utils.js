export const CSS_UNITS = 96.0 / 72.0;

export const getKey = (id, page) => `${id}_${page}`

export function debounce(func, wait, immediate) {

    let timeout, result;

    return function () {
        const context = this;
        const args = arguments;

        if (timeout) clearTimeout(timeout);
        if (immediate) {
            // 如果已经执行过，不再执行
            var callNow = !timeout;
            timeout = setTimeout(function () {
                timeout = null;
            }, wait)
            if (callNow) result = func.apply(context, args)
        } else {
            timeout = setTimeout(function () {
                func.apply(context, args)
            }, wait);
        }
        return result;
    }
}