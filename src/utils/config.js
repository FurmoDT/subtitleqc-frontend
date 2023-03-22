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
            en: {
                name: '영어',
                maxLine: {value: 1, level: 'required'},
                maxCharacter: {value: 55, level: 'required'},
                cps: {value: 30, level: 'optional'}
            },
            zh: {
                name: '중국어',
                maxLine: {value: 1, level: 'required'},
                maxCharacter: {value: 18, level: 'required'},
                cps: {value: 30, level: 'optional'}
            }
        }
    },
    {
        client: 'KCP',
        language: {
            en: {
                name: '영어',
                maxLine: {value: 2, level: 'required'},
                maxCharacter: {value: 42, level: 'required'},
                tcRange: {min: 1, max: 7, level: 'optional'}
            }
        }
    },
    {
        client: 'HYBE',
        language: {
            en: {name: '영어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 42, level: 'required'}},
            zh: {name: '중국어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 20, level: 'required'}},
            jp: {name: '일어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 16, level: 'required'}},
            es: {name: '스페인어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 42, level: 'required'}}
        }
    },
    {
        client: 'YG',
        language: {
            zh: {name: '중국어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 18, level: 'required'}},
            jp: {name: '일어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 24, level: 'required'}},
            es: {name: '스페인어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 45, level: 'required'}},
            th: {name: '태국어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 45, level: 'required'}},
            id: {name: '인니어', maxLine: {value: 4, level: 'required'}, maxCharacter: {value: 45, level: 'required'}}
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
