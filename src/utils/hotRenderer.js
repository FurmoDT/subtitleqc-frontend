import {tcToSec} from "./functions";

const setTDColor = (td, backgroundColor) => {
    td.style.backgroundColor = backgroundColor
    if (backgroundColor === 'red') td.style.color = 'white'
}

const isTCValid = (timecode) => {
    return timecode?.match(`^(\\d{2}:\\d{2}:\\d{2}[\\.|,]\\d{3})$`)
}

export const tcInValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    if (v) {
        const error = new Set()
        if (guideline.tcRange?.level !== 'none') {
            if (tcToSec(instance.getDataAtCell(r, c + 1)) - tcToSec(v) < guideline.tcRange?.min) {
                setTDColor(td, guideline.tcRange.level === 'required' ? 'red' : 'yellow')
                error.add('TC Range Under 1 Second')
            }
            if (tcToSec(instance.getDataAtCell(r, c + 1)) - tcToSec(v) > guideline.tcRange?.max) {
                setTDColor(td, guideline.tcRange.level === 'required' ? 'red' : 'yellow')
                error.add('TC Range Over 7 Seconds')
            }
        }
        if (!isTCValid(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (tcToSec(instance.getDataAtCell(r - 1, c + 1)) > tcToSec(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
    }
}

export const tcOutValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    if (v) {
        const error = new Set()
        if (guideline.tcRange?.level !== 'none') {
            if (tcToSec(v) - tcToSec(instance.getDataAtCell(r, c - 1)) < guideline.tcRange?.min) {
                setTDColor(td, guideline.tcRange.level === 'required' ? 'red' : 'yellow')
                error.add('TC Range Under 1 Second')
            }
            if (tcToSec(v) - tcToSec(instance.getDataAtCell(r, c - 1)) > guideline.tcRange?.max) {
                setTDColor(td, guideline.tcRange.level === 'required' ? 'red' : 'yellow')
                error.add('TC Range Over 7 Seconds')
            }
        }
        if (!isTCValid(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (tcToSec(instance.getDataAtCell(r, c - 1)) > tcToSec(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
    }
}

export const textValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.position = 'relative'
    td.style.paddingRight = '75px'
    const label = document.createElement('label');
    if (v) {
        td.innerHTML = `<label style="text-overflow: ellipsis; display: block; white-space: pre; overflow: hidden; font-size: ${fontSize}">${v}</label>`
        v = v.replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '').replaceAll(/{(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+}/g, '')
        const error = new Set()
        const language = guideline.language[instance.colToProp(c).slice(0, 2)]
        if (language) {
            if (language.maxLine && v.split('\n').length > language.maxLine.value) {
                setTDColor(td, language.maxLine.level === 'required' ? 'red' : 'yellow')
                error.add('Max Lines Exceeded')
            }
            v.split('\n').forEach((value) => {
                if (language.maxCharacter && value.length > language.maxCharacter.value) {
                    setTDColor(td, language.maxCharacter.level === 'required' ? 'red' : 'yellow')
                    error.add('Max Characters Exceeded')
                }
            })
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
    }
    label.style.position = 'absolute'
    label.style.top = 0
    label.style.right = 0
    label.style.whiteSpace = 'pre'
    label.style.fontSize = '10px'
    label.style.paddingRight = '5px'
    label.style.textAlign = 'right'
    label.style.color = 'lightgray'
    label.textContent = `cps: ${v?.length || 0} ${v?.split('\n').map(val => `len: ${val.length}`).join('\n') || 'len: 0'}`;
    td.appendChild(label);
}
