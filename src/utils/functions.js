export const bisect = (arr, target) => {
    let left = 0
    let right = arr.length - 1
    while (left < right) {
        let middle = parseInt((right + left) / 2)
        if (arr[middle] < target) left = middle + 1
        else right = middle
    }
    return left
};

export const TCtoSec = (tc) => {
    try {
        const t = tc.split(':')
        return Number(t[0]) * 60 * 60 + Number(t[1]) * 60 + Number(t[2].replace(',', '.'))
    } catch (error) {
        return NaN
    }
}
