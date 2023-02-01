export const tcInValidator = (r, c, v, td) => {
}

export const tcOutValidator = (r, c, v, td) => {
}

export const textValidator = (r, c, v, td) => {
    const label = document.createElement('label');
    label.style.float = 'right'
    label.style.fontSize = '10px'
    label.textContent = `cps: ${v?.length || 0}`;
    td.appendChild(label);
}
