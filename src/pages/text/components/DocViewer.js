import FileViewer from "react-file-viewer";
import {useEffect, useState} from "react";
import axios from "../../../utils/axios";

const DocViewer = ({textFile}) => {
    const [docxFile, setDocxFile] = useState(null)

    useEffect(() => {
        axios.get(textFile, {headers: {Authorization: null}, responseType: 'blob'}).then((response) => {
            const reader = new FileReader();
            const file = new File([response.data], '', {type: response.headers['content-type']});
            reader.onload = () => setDocxFile(reader.result)
            reader.readAsDataURL(file);
        })
    }, [textFile])

    return <>
        <div style={{height: '100%', overflow: 'auto'}}>
            {docxFile && <FileViewer filePath={docxFile} fileType={'docx'}/>}
        </div>
    </>
};

export default DocViewer
