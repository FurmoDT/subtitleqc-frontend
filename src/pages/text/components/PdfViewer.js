import {useEffect, useState} from "react";
import {Document, Page, pdfjs} from "react-pdf";
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import axios from "../../../utils/axios";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = (props) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfFile, setPdfFile] = useState(null)

    useEffect(() => {
        axios.get('https://s3.subtitleqc.ai/test.pdf', {headers: {Authorization: null}}).then((response) => {
            setPdfFile(URL.createObjectURL(new Blob([response.data], {type: response.headers['content-type']})))
        })
    }, [])

    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    }


    return <div>
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber}/>
        </Document>
    </div>;
};

export default PdfViewer
