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
    xxXX: '기타언어',
}
export const extraCodes = {nar: '화자', memo: '메모'}

export const workType = {sync: '싱크', transcribe: '대본', translate: '번역', qc: '감수'}

export const guidelines = new Map([
    [
        'KW', {
        client: 'KBS WORLD',
        language: {
            en: {
                name: '영어',
                maxLine: {value: 1, level: 'required'},
                maxCharacter: {value: 55, level: 'required'},
                cps: {value: 30, level: 'optional'},
                parenthesis: {regex: '\\([^()]*\\)'},
                dialog: {regex: '-\\s(?!\\s)(.*\\S)?(?<!\\s)\\s/\\s-\\s[^\\s].*', sample: '- Hi / - Hello'}
            },
            zh: {
                name: '중국어',
                maxLine: {value: 1, level: 'required'},
                maxCharacter: {value: 18, level: 'required'},
                cps: {value: 30, level: 'optional'},
                parenthesis: {regex: '（[^（）]*）'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-(?!\\s)(.*\\S)?(?<!\\s)\\s\\s-[^\\s].*', sample: '-你好  -你好'}
            }
        },
        musicNote: '♪'
    }],
    ['KCP', {
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
    }],
    ['HYBE', {
        client: 'HYBE',
        language: {
            en: {
                name: '영어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 42, level: 'optional'},
                // parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-[^\\s].*', sample: '-Hi\n-Hello'}
            },
            zh: {
                name: '중국어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 20, level: 'optional'},
                // parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- 你好\n- 你好'}
            },
            ja: {
                name: '일어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 16, level: 'optional'},
                // parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- こんにちは\n- こんにちは'}
            },
            es: {
                name: '스페인어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 42, level: 'optional'},
                // parenthesis: {regex: '^\\[[^\\[\\]]*\\]$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Hola\n- Hola'}
            }
        },
        musicNote: '♪'
    }],
    ['YG', {
        client: 'YG',
        language: {
            zh: {
                name: '중국어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 18, level: 'optional'},
                // parenthesis: {regex: '^（[^（）]*）$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- 你好\n- 你好'}
            },
            ja: {
                name: '일어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 24, level: 'optional'},
                // parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- こんにちは\n- こんにちは'}
            },
            es: {
                name: '스페인어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 45, level: 'optional'},
                // parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Hola\n- Hola'}
            },
            th: {
                name: '태국어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 45, level: 'optional'},
                // parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- สวัสดี\n- สวัสดี'}
            },
            id: {
                name: '인니어',
                maxLine: {value: 4, level: 'required'},
                maxCharacter: {value: 45, level: 'optional'},
                // parenthesis: {regex: '^\\([^()]*\\)$'},
                period: {regex: '(?<!\\.)\\.(?!\\.)$'},
                dialog: {regex: '-\\s[^\\s].*', sample: '- Halo\n- Halo'}
            }
        },
        musicNote: '♪'
    }],
    ['SBS', {
        client: 'SBS',
        language: {
            ko: {
                name: '한국어',
                maxLine: {value: 2, level: 'required'},
                maxCharacter: {value: 18, level: 'required'},
                count: {bytes2: 1, latin: 0.5, extra: 0.5}
            },
            en: {
                name: '영어',
                maxLine: {value: 2, level: 'required'},
                maxCharacter: {value: 45, level: 'required'},
                count: {bytes2: 2, latin: 1, extra: 1}
            }
        },
        tcRange: {min: 0.3, max: 7, level: 'required'},
        tcInterval: {value: 0.083, nonZero: true, level: 'required'},
    }],
    ['CUSTOM', {
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
    }]
])

export const defaultSubtitle = () => (Array.from({length: 100}, () => ({rowId: v4()})))
export const defaultLanguage = () => []
export const defaultProjectDetail = () => ({name: '', guideline: {client: '', language: {}}})
export const workTypeSelectOption = Object.entries(workType).map(([value, label]) => ({value, label}));
export const languageSelectOption = Object.entries(languageCodes).map(([value, label]) => ({value, label}))
export const genreSelectOption = [
    {value: 'drama', label: '드라마'},
    {value: 'entertainment', label: '예능'},
    {value: 'movie', label: '영화'},
    {value: 'documentary', label: '다큐'},
    {value: 'proposal', label: '기획안'},
    {value: 'script', label: '대본'},
    {value: 'synopsis', label: '시놉시스'},
    {value: 'etc', label: '기타 문서'},
]
export const publicUrl = process.env.REACT_APP_PUBLIC_URL
export const localApiUrl = process.env.REACT_APP_LOCAL_API_URL
export const apiUrl = process.env.REACT_APP_API_URL
export const wsUrl = process.env.REACT_APP_WS_URL
export const localWsUrl = process.env.REACT_APP_LOCAL_WS_URL
export const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
export const naverClientId = process.env.REACT_APP_NAVER_CLIENT_ID
