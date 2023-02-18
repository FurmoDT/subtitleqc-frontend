export const languageCodes = {
    koKR: '한국어',
    enUS: '영어',
    jaJP: '일어',
    zhCN: '중국어',
    viVN: '베트남어',
    thTH: '태국어',
    idID: '인니어',
    arAE: '아랍어',
    ruRU: '러시아어',
    frFR: '프랑스어',
    esES: '스페인어',
    xxXX: '기타 언어',
    nar: '화자',
    memo: '메모',
}

export const defaultSubtitle = Array.from({length: 100}, () => ({}))
// export const defaultLanguage = [{code: 'xxXX', name: '기타 언어', counter: 1}]
export const defaultLanguage = []

export const publicUrl = process.env.REACT_APP_PUBLIC_URL
