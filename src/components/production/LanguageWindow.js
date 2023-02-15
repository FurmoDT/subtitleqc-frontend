import Handsontable from 'handsontable';
import '../../css/Handsontable.css'
import * as Grammarly from '@grammarly/editor-sdk'
import {useEffect, useRef} from "react";
import {tcInValidator, tcOutValidator, textValidator} from "../../utils/hotRenderer";
import {languageCodes} from "../../utils/config";

const grammarly = (async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn"))()


const LanguageWindow = (props) => {
    const setLanguages = props.setLanguages
    const containerMain = useRef(null);

    useEffect(() => {
        props.hotRef.current?.destroy()

        function tcInRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcInValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize)
        }

        function tcOutRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcOutValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize)
        }

        function textRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            textValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize)
        }

        props.hotRef.current = new Handsontable(containerMain.current, {
            data: props.cellDataRef.current,
            columns: [
                {data: 'start', type: 'text', renderer: tcInRenderer},
                {data: 'end', type: 'text', renderer: tcOutRenderer},
                ...props.languages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textRenderer : 'text'
                    }
                }),
                // {data: 'error', type: 'text'},
            ],
            colHeaders: ['TC_IN', 'TC_OUT', ...props.languages.map((value) => value.name), 'error'],
            rowHeaders: true,
            stretchH: 'last',
            width: props.size.width,
            height: props.size.height - 190,
            minSpareRows: 2,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
            manualColumnResize: true,
        })
        let grammarlyPlugin = null
        props.hotRef.current.addHook('afterBeginEditing', (row) => {
            grammarly.then(r => {
                grammarlyPlugin = r.addPlugin(
                    containerMain.current.querySelector('textarea'),
                    {
                        documentDialect: "american",
                    },
                )
                containerMain.current.querySelector('grammarly-editor-plugin').querySelector('textarea').focus()
            });
        })
        props.hotRef.current.addHook('afterChange', (changes) => {
            grammarlyPlugin?.disconnect()
            localStorage.setItem('cellData', JSON.stringify(props.cellDataRef.current))
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            props.hotSelectionRef.current.rowStart = row
            props.hotSelectionRef.current.columnStart = column
            props.hotSelectionRef.current.rowEnd = row2
            props.hotSelectionRef.current.columnEnd = column2
        })
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.hotRef, props.hotSelectionRef])

    useEffect(() => {
        if (props.languageFile) {
            props.cellDataRef.current = props.languageFile.data
            setLanguages(props.languageFile.languages.map((value) => {
                const [code, counter] = value.split('_').map((value, index) => (!index ? (languageCodes.hasOwnProperty(value) ? value : 'other') : value))
                return {code: code, name: languageCodes[code] + (counter > 1 ? `(${counter})` : ''), counter: counter}
            }))
        } else {
            props.hotRef.current?.setDataAtCell([[0, 0, '00:00:00,000'], [0, 1, '00:00:00,000']])
        }
    }, [setLanguages, props.cellDataRef, props.languageFile, props.hotRef])

    return <div ref={containerMain}/>
}

export default LanguageWindow
