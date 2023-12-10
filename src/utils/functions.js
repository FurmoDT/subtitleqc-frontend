import {getInfo} from 'react-mediainfo'

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
    if (/^\d{2}:\d{2}:\d{2}[.,]\d{3}$/.test(tc)) {
        const t = tc.split(':')
        return Number((Number(t[0]) * 60 * 60 + Number(t[1]) * 60 + Number(t[2].replace(',', '.'))).toFixed(3))
    } else {
        return NaN
    }
}

export const secToTc = (sec) => {
    const validSec = sec || 0
    const h = Math.floor(validSec / 3600).toString().padStart(2, '0')
    const m = Math.floor((validSec % 3600) / 60).toString().padStart(2, '0')
    const s = (validSec % 60).toFixed(3).padStart(6, '0')
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

export const splitLine = (line) => {
    const center = Math.floor(line.length / 2);
    const nearestLeft = Math.max(line.lastIndexOf(' ', center), line.lastIndexOf('\n', center));
    const nearestRight = Math.min(...[line.indexOf(' ', center), line.indexOf('\n', center)].filter(value => value !== -1));
    let nearestIndex = line.length
    if (nearestLeft > -1 && nearestRight < Infinity) nearestIndex = center - nearestLeft < nearestRight - center ? nearestLeft : nearestRight
    else if (nearestLeft > -1) nearestIndex = nearestLeft
    else if (nearestRight < Infinity) nearestIndex = nearestRight
    return [line.substring(0, nearestIndex), line.substring(nearestIndex + 1)];
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
    const date = new Date(timestamp)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours() % 12 || 12).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${year}.${month}.${day} ${hours}:${minutes} ${ampm}`;
}

export const convertToTimestamp = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    return dateTime.getTime()
}

export const generateHexColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
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

export const getFileInfo = async (file) => {
    if (!file) return null
    else if (fileType(file.name) === 'video') {
        const videoInfo = (await getInfo(file))?.media?.track.find(track => track['@type'] === 'Video')
        return JSON.stringify({name: file.name, framerate: videoInfo?.FrameRate, duration: videoInfo?.Duration})
    } else if (fileType(file.name) === 'text') {
        return JSON.stringify({name: file.name})
    }
}
