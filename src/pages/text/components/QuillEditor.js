import ReactQuill from "react-quill";
import {useRef, useState} from "react";
import 'react-quill/dist/quill.snow.css';

const QuillEditor = () => {
    const [value, setValue] = useState('');
    const reactQuillRef = useRef(null)

    const modules = {
        toolbar: {
            container: [[{size: ['small', false, 'large', 'huge']}], [{'color': []}, {'background': []}], ['bold', 'italic', 'underline', 'strike'], ['clean']]
        }
    }

    return <ReactQuill ref={reactQuillRef} modules={modules} theme={'snow'} value={value} onChange={setValue}
                       style={{width: '100%', height: '100%'}}/>
};

export default QuillEditor
