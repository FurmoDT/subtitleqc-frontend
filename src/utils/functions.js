export const bisect = (arr, target) => {
    let left = 0
    let right = arr.length - 1
    while (left < right) {
        let middle = Math.floor((right + left) / 2)
        if (arr[middle] < target) left = middle + 1
        else right = middle
    }
    return left
};

export const tcToSec = (tc) => {
    try {
        const t = tc.split(':')
        return Number((Number(t[0]) * 60 * 60 + Number(t[1]) * 60 + Number(t[2].replace(',', '.'))).toFixed(3))
    } catch (error) {
        return NaN
    }
}

export const secToTc = (sec) => {
    const h = Math.floor(sec / 3600).toString().padStart(2, '0')
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
    const s = (sec % 60).toFixed(3).padStart(6, '0')
    return `${h}:${m}:${s}`
}

export const createSegment = (start, end, id, editable) => {
    return {
        startTime: start,
        endTime: end,
        color: 'darkgrey',
        editable: !editable,
        id: id
    }
}
