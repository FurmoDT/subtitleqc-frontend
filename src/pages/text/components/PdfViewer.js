import {useEffect, useRef, useState} from "react";
import {Document, Page, pdfjs} from "react-pdf";
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import axios from "../../../utils/axios";
import {MDBBtn, MDBIcon, MDBInput, MDBRange} from "mdb-react-ui-kit";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({textFile}) => {
    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfFile, setPdfFile] = useState(null)
    const pageNumRef = useRef(null)
    const [scale, setScale] = useState(1)

    useEffect(() => {
        axios.get(textFile, {headers: {Authorization: null}, responseType: 'blob'}).then((response) => {
            setPdfFile(URL.createObjectURL(new Blob([response.data], {type: response.headers['content-type']})))
        })
    }, [])

    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    }

    useEffect(() => {
        pageNumRef.current.value = pageNumber
    }, [pageNumber])

    return <>
        <div style={{height: 'calc(100% - 30px)', overflow: 'auto'}}>
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} scale={scale}/>
            </Document>
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 0.5rem'
        }}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <MDBBtn style={{paddingLeft: 5, paddingRight: 5}} color={'link'} size={'sm'}
                        onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}>
                    <MDBIcon fas icon="caret-left" color={'dark'} size={'lg'}/>
                </MDBBtn>
                <MDBInput ref={pageNumRef} wrapperStyle={{width: '3.5rem', height: '1.5rem', display: 'flex'}}
                          style={{fontSize: '0.75rem', lineHeight: '1rem'}} defaultValue={1} type={'number'}
                          onInput={(event) => {
                              if (event.target.value >= 1 && event.target.value <= numPages) {
                                  setPageNumber(parseInt(event.target.value))
                              } else if (!event.target.value) {
                              } else event.target.value = pageNumber
                          }}/>
                <label style={{fontSize: '0.75rem'}}>&nbsp;/&nbsp;{numPages}</label>
                <MDBBtn style={{paddingLeft: 5, paddingRight: 5}} color={'link'} size={'sm'}
                        onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages))}>
                    <MDBIcon fas icon="caret-right" color={'dark'} size={'lg'}/>
                </MDBBtn>
            </div>
            <MDBRange style={{display: 'flex'}} step={'10'} defaultValue={0}
                      onChange={(event) => setScale(1 + parseFloat(`${event.target.value}`) / 100)}/>
        </div>
    </>
};

export default PdfViewer
