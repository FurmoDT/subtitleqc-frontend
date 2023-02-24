import Handsontable from 'handsontable';
import '../../css/Handsontable.css'
import * as Grammarly from '@grammarly/editor-sdk'
import {useEffect, useRef} from "react";
import {tcInValidator, tcOutValidator, textValidator} from "../../utils/hotRenderer";
import {tcToSec} from "../../utils/functions";

const grammarly = (async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn"))()


const LanguageWindow = (props) => {
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
            data: !props.fxToggle ? props.cellDataRef.current : props.fxRef.current,
            columns: [
                {data: 'start', type: 'text', renderer: tcInRenderer},
                {data: 'end', type: 'text', renderer: tcOutRenderer},
                ...(!props.fxToggle ? props.languages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textRenderer : 'text'
                    }
                }) : props.fxLanguages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textRenderer : 'text'
                    }
                }))
                // {data: 'error', type: 'text'},
            ],
            colHeaders: ['TC_IN', 'TC_OUT', ...(!props.fxToggle ? props.languages.map((value) => value.name) : props.fxLanguages.map((value) => value.name)), 'error'],
            rowHeaders: true,
            width: props.size.width,
            height: props.size.languageWindowHeight,
            minSpareRows: 2,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
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
            const tcIn = props.hotRef.current.getDataAtCell(row, 0)
            if (tcIn) props.playerRef.current.seekTo(tcToSec(tcIn), 'seconds')
        })
        props.hotRef.current.addHook('afterChange', (changes) => {
            grammarlyPlugin?.disconnect()
            !props.fxToggle ? localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current)) : localStorage.setItem('fx', JSON.stringify(props.fxRef.current))
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            props.hotSelectionRef.current.rowStart = Math.min(row, row2)
            props.hotSelectionRef.current.columnStart = Math.min(column, column2)
            props.hotSelectionRef.current.rowEnd = Math.max(row, row2)
            props.hotSelectionRef.current.columnEnd = Math.max(column, column2)
        })
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.hotRef, props.hotSelectionRef, props.playerRef, props.fxToggle, props.fxRef, props.fxLanguages])

    return <div ref={containerMain}/>
}

export default LanguageWindow
