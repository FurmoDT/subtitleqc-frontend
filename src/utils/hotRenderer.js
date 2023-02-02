export const tcInValidator = (r, c, v, td) => {
}

export const tcOutValidator = (r, c, v, td) => {
}

export const textValidator = (r, c, v, td) => {
    const label = document.createElement('label');
    if (v) td.innerHTML = `<label>${v}</label>`
    label.style.float = 'right'
    label.style.fontSize = '10px'
    label.style.paddingLeft = '5px'
    label.style.textAlign = 'right'
    label.textContent = `cps: ${v?.length || 0} ${v?.split('\n').map(val => `len: ${val.length}`).join('\n') || 'len: 0'}`;
    td.appendChild(label);
}
