export const parseSrt = (srtText) => {
    const language = 'other_1'
    const normalizedSrtData = srtText.replace(/\r\n/g, '\n');
    const lines = normalizedSrtData.split('\n');
    const items = [];

    let o = {
        [language]: ''
    };

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
            o = {[language]: ''};
        } else { // text
            if (lines[i + 1] === '') {
                lineBreak = '';
            }
            o[language] += line + lineBreak;
        }
    }
    return {languages: [language], data: items}
}

export const parseFsp = (fspJson) => {
    const items = []
    const subtitle = fspJson.elements[0].elements[5].elements
    const language = fspJson.elements[0].elements[4].elements.map((value) => (value.attributes.code))
    const languageCounts = language.reduce((acc, v) => {
        if (v in acc) acc[v]++
        else acc[v] = 1
        return acc
    }, {})
    const languages = []
    for (let i = language.length - 1; i >= 0; i--) {
        const item = language[i];
        languages.unshift(`${item}_${languageCounts[item]--}`);
    }
    for (let i = 0; i < subtitle.length; i++) {
        const line = {}
        line.start = subtitle[i].attributes.i ? `0${subtitle[i].attributes.i}` : ''
        line.end = subtitle[i].attributes.o ? `0${subtitle[i].attributes.o}` : ''
        subtitle[i].elements.forEach((v, index) => {
            line[languages[index]] = v.elements ? v.elements[0].text.replaceAll('|', '\n').split('\n').map(v => v.trim()).join('\n') : ''
        })
        items.push(line)
    }
    return {languages: languages, data: items}
}
