import Handsontable from 'handsontable';
import '../../css/Handsontable.css'
import {useEffect, useRef} from "react";
import {tcInValidator, tcOutValidator, textValidator} from "../../utils/hotRenderer";

let hot


const LanguageWindow = (props) => {
    const containerMain = useRef(null);
    useEffect(() => {
        if (props.languageFile) props.cellDataRef.current = props.languageFile
        //TODO set props.languages with existing languages
    }, [props.cellDataRef, props.languageFile])

    useEffect(() => {
        if (hot) hot.destroy()

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

        hot = new Handsontable(containerMain.current, {
            data: props.cellDataRef.current,
            columns: [
                {data: 'start', type: 'text', renderer: tcInRenderer},
                {data: 'end', type: 'text', renderer: tcOutRenderer},
                ...props.languages.map((value) => {
                    return {data: value.id, type: 'text', renderer: textRenderer}
                }),
                {data: 'error', type: 'text'},
            ],
            colHeaders: ['TC_IN', 'TC_OUT', ...props.languages.map((v) => v.name), 'error'],
            rowHeaders: true,
            stretchH: 'last',
            width: props.size.width,
            height: props.size.height - 190,
            minSpareRows: 2,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
            manualColumnResize: true,
        })
        hot.setDataAtCell([[0, 0, '00:00:00,000'], [0, 1, '00:00:00,000'], [0, 2, '-'.repeat(100)]])
    }, [props.size, props.cellDataRef, props.hotFontSize, props.languageFile, props.languages])

    return <div ref={containerMain}/>
}

export default LanguageWindow
