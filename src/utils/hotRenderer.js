const setTDColor = (td, backgroundColor) => {
    td.style.backgroundColor = backgroundColor
    if (backgroundColor === 'red') td.style.color = 'white'
}

const isTCValid = (timecode) => {
    return timecode?.match(`^(\\d{2}:\\d{2}:\\d{2}[\\.|,]\\d{3})`)
}

export const tcInValidator = (r, c, v, td, fontSize, instance) => {
    td.style.fontSize = fontSize
    if (v) {
        if (!isTCValid(v)) setTDColor(td, 'red')
        if (instance.getDataAtCell(r - 1, c + 1) > v) setTDColor(td, 'red')
    }
}

export const tcOutValidator = (r, c, v, td, fontSize, instance) => {
    td.style.fontSize = fontSize
    if (v) {
        if (!isTCValid(v)) setTDColor(td, 'red')
        if (instance.getDataAtCell(r, c - 1) > v) setTDColor(td, 'red')
    }
}

export const textValidator = (r, c, v, td, fontSize) => {
    const label = document.createElement('label');
    if (v) td.innerHTML = `<label style="text-overflow: ellipsis; display: block; white-space: pre; overflow: hidden; font-size: ${fontSize}">${v}</label>`
    label.style.whiteSpace = 'pre'
    label.style.float = 'right'
    label.style.fontSize = '10px'
    label.style.paddingLeft = '5px'
    label.style.textAlign = 'right'
    label.style.color = 'lightgray'
    label.textContent = `cps: ${v?.length || 0} ${v?.split('\n').map(val => `len: ${val.length}`).join('\n') || 'len: 0'}`;
    td.appendChild(label);
}
