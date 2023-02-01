import Handsontable from 'handsontable';
import '../../css/Handsontable.css'
import {useEffect, useRef} from "react";

let hot


const LanguageWindow = (props) => {
    const containerMain = useRef(null);

    function sampleRenderer(instance, td) {
        Handsontable.renderers.TextRenderer.apply(this, arguments)
        td.style.backgroundColor = 'yellow';
    }

    function textRenderer(instance, td) {
        Handsontable.renderers.TextRenderer.apply(this, arguments)
        const label = document.createElement('label');
        label.style.float = 'right'
        label.style.fontSize = '10px'
        label.textContent = "cps: 0";
        td.appendChild(label);
    }

    useEffect(() => {
        if (hot) hot.destroy()
        const languages = {text: 'TEXT'}
        hot = new Handsontable(containerMain.current, {
            columns: [
                {data: 'start', type: 'text', renderer: sampleRenderer},
                {data: 'end', type: 'text'},
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
            startRows: 100,
            minSpareRows: 2,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
            manualColumnResize: true,
        })
    }, [props.size, props.cellDataRef]);

    return <div ref={containerMain}/>
}

export default LanguageWindow
