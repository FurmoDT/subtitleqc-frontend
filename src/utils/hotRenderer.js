import {tcToSec} from "./functions";

const LEVEL = {required: 'red', optional: 'yellow'}

const setTDColor = (td, backgroundColor) => {
    if (td.style.backgroundColor !== 'red') td.style.backgroundColor = backgroundColor
    if (backgroundColor === 'red') td.style.color = 'white'
}

const isTCValid = (timecode) => timecode?.match(`^(\\d{2}:\\d{2}:\\d{2}[\\.|,]\\d{3})$`)

export const tcInValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    if (v) {
        const error = new Set()
        const interval = parseFloat((tcToSec(v) - tcToSec(instance.getDataAtCell(r - 1, c + 1))).toFixed(3))
        if (!isTCValid(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (interval > 0) {
            if (interval < guideline.tcInterval?.value) {
                setTDColor(td, LEVEL[guideline.tcInterval.level])
                error.add(`TC Interval Under ${guideline.tcInterval.value} seconds`)
            }
        } else if (interval < 0) {
            setTDColor(td, 'red')
            error.add('TC Interval Overlaps')
        } else if (interval === 0) {
            if (guideline.tcInterval?.nonZero) {
                setTDColor(td, LEVEL[guideline.tcInterval.level])
                error.add('Non Zero TC Interval')
            }
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
    }
}

export const tcOutValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    if (v) {
        const error = new Set()
        const interval = parseFloat((tcToSec(instance.getDataAtCell(r + 1, c - 1)) - tcToSec(v)).toFixed(3))
        if (!isTCValid(v)) {
            setTDColor(td, 'red')
            error.add('Invalid TC')
        }
        if (interval > 0) {
            if (interval < guideline.tcInterval?.value) {
                setTDColor(td, LEVEL[guideline.tcInterval.level])
                error.add(`TC Interval Under ${guideline.tcInterval.value} seconds`)
            }
        } else if (interval < 0) {
            setTDColor(td, 'red')
            error.add('TC Interval Overlaps')
        } else if (interval === 0) {
            if (guideline.tcInterval?.nonZero) {
                setTDColor(td, LEVEL[guideline.tcInterval.level])
                error.add('Non Zero TC Interval')
            }
        }
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
    }
}

export const durationValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    td.classList.remove('htDimmed')
    td.classList.add('text-center')
    const [start, end] = instance.getDataAtRow(r).slice(0, 2).map(value => tcToSec(value))
    const duration = parseFloat((end - start).toFixed(3))
    const error = new Set()
    if (duration) td.innerHTML = duration
    else if (0 <= start || 0 <= end) {
        setTDColor(td, 'red')
        error.add(`TC Range Error`)
    }
    if (LEVEL[guideline.tcRange?.level]) {
        if (duration < guideline.tcRange?.min) {
            setTDColor(td, LEVEL[guideline.tcRange.level])
            error.add(`TC Range Under ${guideline.tcRange.min} Second`)
        } else if (duration > guideline.tcRange?.max) {
            setTDColor(td, LEVEL[guideline.tcRange.level])
            error.add(`TC Range Over ${guideline.tcRange.max} Seconds`)
        }
    }
    if (error.size) td.setAttribute('title', [...error].join('\n'))
    else td.removeAttribute('title')
}

export const textValidator = (r, c, v, td, fontSize, instance, guideline) => {
    td.style.fontSize = fontSize
    td.style.position = 'relative'
    td.classList.add('td-custom-text')
    const span = document.createElement('span');
    if (v) {
        // v = v.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
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
                v = v.replace(/[ \t]+/g, " ")
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
        span.innerHTML = `<span class=${cps > language?.cps?.value ? 'td-bg-' + LEVEL[language.cps.level] : ''}>cps: ${cps}</span>`
        span.innerHTML += `&nbsp;`
        span.innerHTML += v.split('\n').map(val => {
            const characters = val.length
            return `<span class=${characters > language?.maxCharacter?.value ? 'td-bg-' + LEVEL[language.maxCharacter.level] : ''}>len: ${String(val.length).padStart(2, ' ')}<br/></span>`
        }) || '<span>len: 0</span>'
        if (error.size) td.setAttribute('title', [...error].join('\n'))
        else td.removeAttribute('title')
    } else {
        span.innerHTML = '<span>cps: 0&nbsp;len: 0</span>'
    }
    span.className = 'position-absolute top-0 text-end pe-1'
    span.style.fontSize = '10px'
    span.style.color = 'lightgray'
    if (instance.colToProp(c).startsWith('arAE')) {
        td.setAttribute('dir', "rtl")
        span.className += ' start-0'
        td.style.paddingLeft = '4.75rem'
    } else {
        span.className += ' end-0'
        td.style.paddingRight = '4.75rem'
    }
    td.appendChild(span);
}
