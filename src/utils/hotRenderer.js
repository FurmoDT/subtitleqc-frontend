const setTDColor = (td, backgroundColor) => {
    td.style.backgroundColor = backgroundColor
    if (backgroundColor === 'red') td.style.color = 'white'
}

const isTCValid = (timecode) => {
    return timecode?.match(`^(\\d{2}:\\d{2}:\\d{2}[\\.|,]\\d{3})`)
}

export const tcInValidator = (r, c, v, td, fontSize) => {
    td.style.fontSize = fontSize
    if (v && !isTCValid(v)) setTDColor(td, 'red')
}

export const tcOutValidator = (r, c, v, td, fontSize) => {
    td.style.fontSize = fontSize
    if (v && !isTCValid(v)) setTDColor(td, 'red')
}

export const textValidator = (r, c, v, td, fontSize) => {
    td.style.fontSize = fontSize
    const label = document.createElement('label');
    if (v) td.innerHTML = `<label>${v}</label>`
    label.style.float = 'right'
    label.style.fontSize = '10px'
    label.style.paddingLeft = '5px'
    label.style.textAlign = 'right'
    label.textContent = `cps: ${v?.length || 0} ${v?.split('\n').map(val => `len: ${val.length}`).join('\n') || 'len: 0'}`;
    td.appendChild(label);
}
