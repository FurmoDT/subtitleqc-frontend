import {v4} from "uuid";

export const languageCodes = {
    koKR: '한국어',
    enUS: '영어',
    jaJP: '일어',
    zhCN: '중국어(간체)',
    zhTW: '중국어(번체)',
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

export const guidelines = [
    {
        client: 'KBS WORLD',
        language: {
            en: {name: '영어', maxLine: 1, maxCharacter: 55, cps: 30},
            zh: {name: '중국어', maxLine: 1, maxCharacter: 18, cps: 30}
        }
    },
    {
        client: 'KCP',
        language: {
            en: {name: '영어', maxLine: 2, maxCharacter: 42}
        }
    },
    {
        client: 'HYBE',
        language: {
            en: {name: '영어', maxLine: 4},
            zh: {name: '중국어', maxLine: 4, maxCharacter: 20},
            jp: {name: '일어', maxLine: 4, maxCharacter: 16},
            es: {name: '스페인어', maxLine: 4, maxCharacter: 42}
        }
    },
    {
        client: 'YG',
        language: {
            zh: {name: '중국어', maxLine: 4, maxCharacter: 18},
            jp: {name: '일어', maxLine: 4, maxCharacter: 24},
            es: {name: '스페인어', maxLine: 4, maxCharacter: 45},
            th: {name: '태국어', maxLine: 4, maxCharacter: 45},
            id: {name: '인니어', maxLine: 4, maxCharacter: 45}
        }
    },
    {
        client: 'CUSTOM',
        language: {
            ko: {name: '한국어'},
            en: {name: '영어'},
            jp: {name: '일어'},
            zh: {name: '중국어'},
            vi: {name: '베트남어'},
            th: {name: '태국어'},
            id: {name: '인니어'},
            ar: {name: '아랍어'},
            ru: {name: '러시아어'},
            fr: {name: '프랑스어'},
            es: {name: '스페인어'},
            xx: {name: '기타언어'}
        }
    }
]

export const defaultSubtitle = () => (Array.from({length: 100}, () => ({rowId: v4()})))
export const defaultLanguage = () => []
export const defaultProjectDetail = () => ({name: '', guideline: {client: '', language: {}}})

export const publicUrl = process.env.REACT_APP_PUBLIC_URL
