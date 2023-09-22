export const bisect = (arr, target) => {
    let left = 0
    let right = arr.length - 1
    while (left < right) {
        let middle = Math.floor((right + left) / 2)
        if (arr[middle] < target) left = middle + 1
        else right = middle
    }
    if (arr[left] < target) return arr.length
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

export const createSegment = (start, end, id) => {
    return {
        startTime: start,
        endTime: end,
        color: 'white',
        editable: false,
        id: id
    }
}

export const birthdayValidator = (value) => {
    value = value.replace(/\D/g, '')
    let [year, month, day] = [value.slice(0, 4), value.slice(4, 6), value.slice(6, 8)]
    if (month) month = '-' + month
    if (day) day = '-' + day
    return year + month + day
}

export const removeNonNumeric = (num) => num.toString().replace(/[^0-9]/g, "");

export const thousandSeperator = (value) => {
    return removeNonNumeric(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export const formatTimestamp = (timestamp) => {
    if (!timestamp) return null
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}\n${hours}:${minutes}`;
}

export const fileExtension = (filename) => {
    return filename?.split('.').pop().toLowerCase()
}

export const fileType = (filename) => {
    const extension = fileExtension(filename)
    if (['mp4', 'mkv'].includes(extension)) {
        return 'video'
    } else if (['docx', 'pdf', 'txt', 'xlsx'].includes(extension)) {
        return 'text'
    } else return null
}
