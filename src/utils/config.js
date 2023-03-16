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

export const clients = [
    {client: 'KBS WORLD', language: {ko: {name: '한국어'}, zh: {name: '중국어'}}},
    {client: 'KCP', language: {en: {name: '영어'}}},
    {client: 'HYBE', language: {en: {name: '영어'}, zh: {name: '중국어'}, jp: {name: '일어'}}},
    {client: 'YG', language: {zh: {name: '중국어'}, jp: {name: '일어'}, es: {name: '스페인어'}, th: {name: '태국어'}, id: {name: '인니어'}}},
    {client: 'CUSTOM', language: {ko: {name: '한국어'}, en: {name: '영어'}, jp: {name: '일어'}, zh: {name: '중국어'}, vi: {name: '베트남어'}, th: {name: '태국어'}, id: {name: '인니어'}, ar: {name: '아랍어'}, ru: {name: '러시아어'}, fr: {name: '프랑스어'}, es: {name: '스페인어'}, xx: {name: '기타언어'}}}
]

export const defaultSubtitle = () => (Array.from({length: 100}, () => ({rowId: v4()})))
export const defaultLanguage = () => []
export const defaultProjectDetail = () => ({name: '', guideline: {client: '', language: {}}})

export const publicUrl = process.env.REACT_APP_PUBLIC_URL
