import ReactQuill from "react-quill";
import {useRef, useState} from "react";
import 'react-quill/dist/quill.snow.css';

const QuillEditor = (props) => {
    const [value, setValue] = useState('');
    const reactQuillRef = useRef(null)

    return <ReactQuill ref={reactQuillRef} style={{width: '100%', height: '100%'}} theme={'snow'} value={value} onChange={setValue}/>;
};

export default QuillEditor
