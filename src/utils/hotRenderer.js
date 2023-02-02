export const tcInValidator = (r, c, v, td) => {
}

export const tcOutValidator = (r, c, v, td) => {
}

export const textValidator = (r, c, v, td) => {
    const label = document.createElement('label');
    label.style.float = 'right'
    label.style.fontSize = '10px'
    label.style.paddingLeft = '5px'
    label.textContent = `len: ${v?.length || 0} cps: ${v?.length || 0}`;
    td.appendChild(label);
}
