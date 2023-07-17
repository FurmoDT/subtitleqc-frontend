import FileViewer from "react-file-viewer";
import {useEffect, useState} from "react";
import axios from "../../../utils/axios";

const DocViewer = ({updateIsRendered}) => {
    const [docxFile, setDocxFile] = useState(null)

    useEffect(() => {
        axios.get('https://s3.subtitleqc.ai/sample.docx', {
            headers: {Authorization: null}, responseType: 'blob'
        }).then((response) => {
            const reader = new FileReader();
            const file = new File([response.data], 'sample.xlsx', {type: response.headers['content-type']});
            reader.onload = () => setDocxFile(reader.result)
            reader.readAsDataURL(file);
        }).finally(() => {
            updateIsRendered()
        })
    }, [updateIsRendered])

    return <>
        <div style={{height: '100%', overflow: 'auto'}}>
            {docxFile && <FileViewer filePath={docxFile} fileType={'docx'}/>}
        </div>
    </>
};

export default DocViewer
