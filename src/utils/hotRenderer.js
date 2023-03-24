import {tcToSec} from "./functions";

const LEVEL = {required: 'red', optional: 'yellow', none: null}

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
        if (LEVEL[guideline.tcRange?.level]) {
            if (tcToSec(instance.getDataAtCell(r, c + 1)) - tcToSec(v) < guideline.tcRange?.min) {
                setTDColor(td, LEVEL[guideline.tcRange.level])
                error.add('TC Range Under 1 Second')
            }
            if (tcToSec(instance.getDataAtCell(r, c + 1)) - tcToSec(v) > guideline.tcRange?.max) {
                setTDColor(td, LEVEL[guideline.tcRange.level])
                error.add('TC Range Over 7 Seconds')
            }
        }
        if (!isTCValid(v) || tcToSec(instance.getDataAtCell(r - 1, c + 1)) > tcToSec(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
    }
}

export const tcOutValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    if (v) {
        const error = new Set()
        if (LEVEL[guideline.tcRange?.level]) {
            if (tcToSec(v) - tcToSec(instance.getDataAtCell(r, c - 1)) < guideline.tcRange?.min) {
                setTDColor(td, LEVEL[guideline.tcRange.level])
                error.add('TC Range Under 1 Second')
            }
            if (tcToSec(v) - tcToSec(instance.getDataAtCell(r, c - 1)) > guideline.tcRange?.max) {
                setTDColor(td, LEVEL[guideline.tcRange.level])
                error.add('TC Range Over 7 Seconds')
            }
        }
        if (!isTCValid(v) || tcToSec(instance.getDataAtCell(r, c - 1)) > tcToSec(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
    }
}

export const textValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.position = 'relative'
    td.style.paddingRight = '75px'
    const label = document.createElement('label');
    if (v) {
        td.innerHTML = `<label style="text-overflow: ellipsis; display: block; white-space: pre; overflow: hidden; font-size: ${fontSize}">${v}</label>`
        const error = new Set()
        if (guideline.musicNote && (v.includes('♪') || v.includes('<') || v.includes('>'))) {
            let valid = true
            if (v.match(/^♪ [^♪\s]+(?:\s+[^♪\s]+)* ♪$/)) {
                if (guideline.musicNote === 'italic') valid = false
            } else if (v.match(/^<i>\S+(?:\s+\S+)*<\/i>$/)) {
                if (guideline.musicNote === '♪') valid = false
            } else valid = false
            if (!valid) {
                setTDColor(td, 'red')
                error.add('Music Note Error')
            }
        }
        v = v.replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '').replaceAll(/{(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+}/g, '')
        const language = guideline.language[instance.colToProp(c).slice(0, 2)]
        if (language) {
            if (language.maxLine && v.split('\n').length > language.maxLine.value) {
                setTDColor(td, LEVEL[language.maxLine.level])
                error.add('Max Lines Exceeded')
            }
            v.split('\n').forEach((value) => {
                if (language.maxCharacter && value.length > language.maxCharacter.value) {
                    setTDColor(td, LEVEL[language.maxCharacter.level])
                    error.add('Max Characters Exceeded')
                }
            })
            if (language.parenthesis) {
                v.split('\n').forEach((value) => {
                    if (/[()[\]（）]/.test(value) && !value.match(language.parenthesis.regex)) {
                        setTDColor(td, 'red')
                        error.add('Parenthesis Error')
                    }
                })
            }
            if (language.period && v.match(language.period.regex)) {
                setTDColor(td, 'red')
                error.add('Period Not Allowed')
            }
        }
        // if (v.includes('  ')) { // multiple spaces
        //     setTDColor(td, 'red')
        //     error.add('Multiple Spaces')
        // }
        if (/(^|[^.])\.{2}(?!\.)/.test(v) || /(^|[^.])\.{4,}(?!\.)/.test(v)) { // 2 or 4+ dots
            setTDColor(td, 'red')
            error.add('2 Or 4+ Dots')
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
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
