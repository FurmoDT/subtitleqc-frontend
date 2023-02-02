import Handsontable from 'handsontable';
import '../../css/Handsontable.css'
import {useEffect, useRef} from "react";
import {tcInValidator, tcOutValidator, textValidator} from "../../utils/hotRenderer";

let hot


const LanguageWindow = (props) => {
    const containerMain = useRef(null);

    function tcInRenderer(instance, td) {
        Handsontable.renderers.TextRenderer.apply(this, arguments)
        tcInValidator(arguments[2], arguments[3], arguments[5], td)
    }

    function tcOutRenderer(instance, td) {
        Handsontable.renderers.TextRenderer.apply(this, arguments)
        tcOutValidator(arguments[2], arguments[3], arguments[5], td)
    }

    function textRenderer(instance, td) {
        Handsontable.renderers.TextRenderer.apply(this, arguments)
        textValidator(arguments[2], arguments[3], arguments[5], td)
    }

    useEffect(() => {
        if (hot) hot.destroy()
        const languages = {text: 'TEXT'}
        hot = new Handsontable(containerMain.current, {
            data: props.cellDataRef.current,
            columns: [
                {data: 'start', type: 'text', renderer: tcInRenderer},
                {data: 'end', type: 'text', renderer: tcOutRenderer},
                ...Object.entries(languages).map(([key, value]) => {
                    return {data: key, type: 'text', renderer: textRenderer}
                }),
                {data: 'error', type: 'text'},
            ],
            colHeaders: ['TC_IN', 'TC_OUT', ...Object.values(languages), 'error'],
            rowHeaders: true,
            stretchH: 'last',
            width: props.size.width,
            height: props.size.height - 180,
            minSpareRows: 2,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
            manualColumnResize: true,
        })
    }, [props.size, props.cellDataRef]);

    return <div ref={containerMain}/>
}

export default LanguageWindow
