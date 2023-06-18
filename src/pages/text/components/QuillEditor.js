import ReactQuill from "react-quill";
import {useMemo, useRef, useState} from "react";
import 'react-quill/dist/quill.snow.css';

const icons = ReactQuill.Quill.import("ui/icons");
icons['undo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" /><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"/></svg>'
icons["redo"] = '<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>'

function undoChange() {
    this.quill.history.undo();
}

function redoChange() {
    this.quill.history.redo();
}

const QuillEditor = () => {
    const [value, setValue] = useState('');
    const reactQuillRef = useRef(null)
    const modules = useMemo(() => {
        return {
            toolbar: {
                container: [[{size: ['small', false, 'large', 'huge']}], [{'color': []}, {'background': []}], ['bold', 'italic', 'underline', 'strike'], ['clean'], ['undo', 'redo']],
                handlers: {
                    undo: undoChange,
                    redo: redoChange
                }
            }, history: {
                delay: 1000, userOnly: true
            }
        }
    }, [])

    return <ReactQuill ref={reactQuillRef} modules={modules} theme={'snow'} value={value} onChange={setValue}
                       style={{width: '100%', height: '100%'}}/>
};

export default QuillEditor
