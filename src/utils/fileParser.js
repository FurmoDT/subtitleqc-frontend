import {languageCodes} from "./config";
import {WebVTTParser} from 'webvtt-parser';
import {secToTc} from "./functions";

export const parseSrt = (srtText) => {
    const normalizedSrtData = srtText.replace(/\r\n/g, '\n');
    const lines = normalizedSrtData.split('\n');
    const items = [];

    let o = {text: ''}

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        let times;
        let lineBreak = '\n';

        if (typeof parseInt(line, 10) === 'number' && (i === 0 || lines[i - 1] === '')) { // index
        } else if (line.indexOf(' --> ') > -1) { // timestamp
            times = line.split(' --> ');
            o.start = times[0];
            o.end = times[1];
        } else if (line === '') { // reset
            items.push(o);
            o = {text: ''};
        } else { // text
            if (lines[i + 1] === '') {
                lineBreak = '';
            }
            o.text += line + lineBreak;
        }
    }
    return {subtitle: items}
}

export const parseFsp = (fspJson, languages) => {
    const items = []
    const subtitle = fspJson.elements[0].elements[5].elements
    const language = fspJson.elements[0].elements[4].elements.map((value) => languageCodes.hasOwnProperty(value.attributes.code) ? value.attributes.code : 'xxXX')
    const languageCounts = language.reduce((acc, v) => {
        if (v in acc) acc[v]++
        else acc[v] = 1
        return acc
    }, languages.reduce((acc, v) => {
        if (v.code in acc) acc[v.code] = Math.max(v.counter, acc[v.code])
        else acc[v.code] = v.counter
        return acc
    }, {}))
    const newLanguages = []
    for (let i = language.length - 1; i >= 0; i--) {
        const item = language[i];
        const itemCounter = languageCounts[item]--
        newLanguages.unshift({
            code: item,
            name: languageCodes[item] + (itemCounter > 1 ? `(${itemCounter})` : ''),
            counter: itemCounter
        })
    }
    for (let i = 0; i < subtitle.length; i++) {
        const line = {}
        line.start = subtitle[i].attributes.i ? `0${subtitle[i].attributes.i}` : ''
        line.end = subtitle[i].attributes.o ? `0${subtitle[i].attributes.o}` : ''
        subtitle[i].elements.forEach((v, index) => {
            line[`${newLanguages[index].code}_${newLanguages[index].counter}`] = v.elements ? v.elements[0].text.replaceAll('|', '\n').split('\n').map(v => v.trim()).join('\n') : ''
        })
        items.push(line)
    }
    return {newLanguages: newLanguages, subtitle: items}
}

export const parseVtt = (vttText) => {
    const parser = new WebVTTParser();
    const tree = parser.parse(vttText, 'metadata');
    return {subtitle: tree.cues.map(v => ({start: secToTc(v.startTime), end: secToTc(v.endTime), text: v.text}))}
}


export const toSrt = (array) => {
    let res = "";
    for (let i = 0; i < array.length; i++) {
        let s = array[i];
        if (s.start && s.end) {
            res += i + 1 + "\r\n";
            res += s.start.replace('.', ',') + " --> " + s.end.replace('.', ',') + "\r\n";
            res += (s.text?.replace("\n", "\r\n") || '') + "\r\n\r\n"
        }
    }
    return res;
}

export const toFspx = (fileData) => {
    return new Blob([JSON.stringify(fileData, null, 2)], {type: 'application/json;charset=utf-8'})
}
