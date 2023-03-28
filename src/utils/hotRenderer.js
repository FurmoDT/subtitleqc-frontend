import {tcToSec} from "./functions";
import "../css/CustomCss.css"

const LEVEL = {required: 'red', optional: 'yellow', none: null}

const setTDColor = (td, backgroundColor) => {
    if (td.style.backgroundColor !== 'red') td.style.backgroundColor = backgroundColor
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
    const label = document.createElement('label');
    if (v) {
        v = v.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
        td.innerHTML = `<label style="text-overflow: ellipsis; display: block; white-space: pre; overflow: hidden; font-size: ${fontSize}">${v}</label>`
        const error = new Set()
        if (guideline.musicNote && (v.includes('♪') || v.includes('<i>') || v.includes('</i>'))) {
            let valid = true
            if (v.match(/♪ [^♪\s]+(?:\s+[^♪\s]+)* ♪/)) {
                if (guideline.musicNote === 'italic') valid = false
            } else if (v.match(/<i>\S+(?:\s+\S+)*<\/i>/)) {
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
            if (language.parenthesis) {
                let line = ''
                v.split('\n').forEach((value) => {
                    if (/[()[\]（）]/.test(value)) {
                        line += value
                        if (line.match(language.parenthesis.regex)) line = ''
                    }
                })
                if (line) {
                    setTDColor(td, 'red')
                    error.add('Parenthesis Error')
                }
            }
            if (language.period && v.match(language.period.regex)) {
                setTDColor(td, 'red')
                error.add('Period Not Allowed')
            }
            if (language.dialog && v.startsWith('-')) {
                let dialog = true
                v.split('\n').forEach((value) => {
                    if (value.startsWith('-') && !value.match(language.dialog.regex)) dialog = false
                })
                if (!dialog) {
                    setTDColor(td, 'red')
                    error.add('Dialog Format Error')
                }
                v = v.replace(/\s+/g, " ")
            }
        }
        if (v.includes('  ')) { // multiple spaces
            setTDColor(td, 'red')
            error.add('Multiple Spaces')
        }
        if (/(^|[^.])\.{2}(?!\.)/.test(v) || /(^|[^.])\.{4,}(?!\.)/.test(v)) { // 2 or 4+ dots
            setTDColor(td, 'red')
            error.add('2 Or 4+ Dots')
        }
        const [start, end] = instance.getDataAtRow(r).slice(0, 2)
        const cps = Math.ceil(v.length / (tcToSec(end) - tcToSec(start))) || 0
        label.innerHTML = `<span class=${cps > language?.cps?.value ? LEVEL[language.cps.level] : ''}>cps: ${cps}</span>`
        label.innerHTML += `&nbsp;`
        label.innerHTML += v.split('\n').map(val => {
            const characters = val.length
            return `<span class=${characters > language?.maxCharacter?.value ? LEVEL[language.maxCharacter.level] : ''}>len: ${String(val.length).padStart(2, ' ')}<br/></span>`
        }) || '<span>len: 0</span>'
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
    } else {
        label.innerHTML = '<span>cps: 0&nbsp;len: 0</span>'
    }
    label.style.position = 'absolute'
    label.style.top = 0
    label.style.whiteSpace = 'pre'
    label.style.fontSize = '10px'
    label.style.color = 'lightgray'
    label.style.textAlign = 'right'
    label.style.paddingRight = '5px'
    if (instance.colToProp(c).startsWith('arAE')) {
        td.setAttribute('dir', "rtl")
        label.style.left = 0
        td.style.paddingLeft = '75px'
    } else {
        label.style.right = 0
        td.style.paddingRight = '75px'
    }
    td.appendChild(label);
}
