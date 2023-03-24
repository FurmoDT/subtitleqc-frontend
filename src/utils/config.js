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
                cps: {value: 30, level: 'optional'},
                parenthesis: {regex: '^\\([^()]*\\)$'},
                dialog: {regex: '-\\s(?!\\s)(.*\\S)?(?<!\\s)\\s/\\s-\\s[^\\s].*', sample: '- Hi / - Hello'}
            },
            zh: {
                name: '중국어',
                maxLine: {value: 1, level: 'required'},
                maxCharacter: {value: 18, level: 'required'},
                cps: {value: 30, level: 'optional'},
                parenthesis: {regex: '^（[^（）]*）$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-(?!\\s)(.*\\S)?(?<!\\s)\\s\\s-[^\\s].*', sample: '-你好  -你好'}
            }
        },
        musicNote: '♪'
    },
    {
        client: 'KCP',
        language: {
            en: {
                name: '영어',
                maxLine: {value: 2, level: 'required'},
                maxCharacter: {value: 42, level: 'required'},
                parenthesis: {regex: '^\\([^()]*\\)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Hi\n- Hello.'}
            }
        },
        tcRange: {min: 1, max: 7, level: 'optional'},
        musicNote: 'italic'
    },
    {
        client: 'HYBE',
        language: {
            en: {
                name: '영어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 42, level: 'optional'},
                parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-[^\\s].*', sample: '-Hi\n-Hello'}
            },
            zh: {
                name: '중국어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 20, level: 'optional'},
                parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- 你好\n- 你好'}
            },
            ja: {
                name: '일어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 16, level: 'optional'},
                parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- こんにちは\n- こんにちは'}
            },
            es: {
                name: '스페인어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 42, level: 'optional'},
                parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Hola\n- Hola'}
            }
        },
        musicNote: '♪'
    },
    {
        client: 'YG',
        language: {
            zh: {
                name: '중국어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 18, level: 'optional'},
                parenthesis: {regex: '^（[^（）]*）$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- 你好\n- 你好'}
            },
            ja: {
                name: '일어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 24, level: 'optional'},
                parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- こんにちは\n- こんにちは'}
            },
            es: {
                name: '스페인어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 45, level: 'optional'},
                parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Hola\n- Hola'}
            },
            th: {
                name: '태국어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 45, level: 'optional'},
                parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- สวัสดี\n- สวัสดี'}
            },
            id: {
                name: '인니어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 45, level: 'optional'},
                parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Halo\n- Halo'}
            }
        },
        musicNote: '♪'
    },
    {
        client: 'CUSTOM',
        language: {
            ko: {name: '한국어'},
            en: {name: '영어'},
            ja: {name: '일어'},
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
