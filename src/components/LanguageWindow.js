import Handsontable from 'handsontable';
import '../css/Handsontable.css'
import {useEffect, useRef} from "react";

let cellData = [{'start': 1, 'end': 2, 'language_koKR': '샘플', 'language_enUS': 'sample'}]
let hot


const LanguageWindow = (props) => {
    const containerMain = useRef(null);

    function sampleRenderer(instance, td) {
        Handsontable.renderers.TextRenderer.apply(this, arguments);
        td.style.backgroundColor = 'yellow';
    }

    useEffect(() => {
        if (hot) hot.destroy()
        hot = new Handsontable(containerMain.current, {
            data: Array.from({length: 100}, () => cellData).flat(),
            columns: [
                {data: "start", type: 'text', renderer: sampleRenderer},
                {data: "end", type: 'text'},
                {data: "language_koKR", type: 'text', className: 'htLeft'},
                {data: "language_enUS", type: 'text', className: 'htLeft'},
            ],
            colHeaders: ['TC_IN', "TC_OUT", "한국어", "영어(미국)"],
            rowHeaders: true,
            stretchH: 'last',
            width: 1200,
            height: 600,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
            manualColumnResize: true,
        })
    }, []);

    return <div ref={containerMain}/>
}

export default LanguageWindow
