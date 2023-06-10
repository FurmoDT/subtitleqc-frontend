import {useCallback, useEffect, useRef, useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBInput,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBRow,
    MDBTextArea,
} from 'mdb-react-ui-kit';
import {aws} from "../../../../utils/awsConfig";

const inputStyle = {backgroundColor: 'white'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}
const baseStyle = {borderStyle: 'none', height: '6rem', overflowY: 'auto', backgroundColor: 'white'};
const dragStyle = {borderStyle: 'dashed', borderColor: '#2196f3'};

let counter = 0

const RequestModal = () => {
    const [basicModal, setBasicModal] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([])
    const toggleShow = () => setBasicModal(!basicModal);
    const dropzoneRef = useRef(null)
    const fileInputRef = useRef(null)
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!counter) {
            counter += 1
            Object.assign(dropzoneRef.current.style, dragStyle);
        }
    }, [])
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, [])
    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation();
        if (e.relatedTarget.tagName === 'DIV') {
            counter--
            Object.assign(dropzoneRef.current.style, baseStyle);
        }
    }, [dropzoneRef])
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        counter--
        Object.assign(dropzoneRef.current.style, baseStyle);
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
            setUploadedFiles(prev => {
                if (prev.map(value => value.name).includes(file.name)) return prev
                else return [...prev, file]
            })
        })
    }, [])
    const handleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.className.includes('btn-close')) {
            setUploadedFiles(prevState => [...prevState.filter((value) => value.name !== e.target.parentElement.innerText)])
            return
        }
        Object.assign(dropzoneRef.current.style, dragStyle);
        fileInputRef.current.click()
        setTimeout(() => Object.assign(dropzoneRef.current.style, baseStyle), 100);
    }, [])
    useEffect(() => {
        Object.assign(dropzoneRef.current.style, baseStyle)
        dropzoneRef.current.addEventListener('dragenter', handleDragEnter)
        dropzoneRef.current.addEventListener('dragover', handleDragOver)
        dropzoneRef.current.addEventListener('dragleave', handleDragLeave)
        dropzoneRef.current.addEventListener('drop', handleDrop)
        dropzoneRef.current.addEventListener('click', handleClick)
    }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleClick])
    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black', marginBottom: '0.5rem'}} onClick={toggleShow}>
            새로운 작업 의뢰하기</MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered>
                <MDBModalContent style={{backgroundColor: '#f28720ff', borderRadius: 0}}>
                    <MDBModalHeader style={{borderBottom: 'none'}}>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <MDBRow className={'mb-3'}>
                            <MDBCol size={3}>
                                <MDBInput style={inputStyle} label={'PM 이름 또는 이메일'} labelStyle={labelStyle}/>
                            </MDBCol>
                            <MDBCol size={6}>
                                <MDBInput style={inputStyle} label={'작업 제목'} labelStyle={labelStyle}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <MDBInput style={inputStyle} label={'납품기한'} labelStyle={labelStyle}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mb-3'}>
                            <MDBCol>
                                <MDBTextArea label='의뢰사항' rows={4} style={inputStyle} labelStyle={labelStyle}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <MDBListGroup ref={dropzoneRef} numbered style={{textAlign: 'left'}}>
                                    {uploadedFiles.length ? uploadedFiles.map((value) => <MDBListGroupItem
                                            key={value.name} style={{padding: '0 0.75rem'}}>{value.name}
                                            <MDBBtn className='btn-close' color='none'
                                                    style={{position: 'absolute', right: 0}} onClick={handleClick}/>
                                        </MDBListGroupItem>) :
                                        <label style={{textAlign: 'left', paddingLeft: '0.75rem', ...labelStyle}}>
                                            파일 업로드 또는 드래그앤드롭</label>}
                                </MDBListGroup>
                                <input ref={fileInputRef} style={{display: 'none'}} multiple type={'file'}
                                       onChange={(e) => {
                                           Array.from(e.target.files).forEach((file) => {
                                               setUploadedFiles(prev => {
                                                   if (prev.map(value => value.name).includes(file.name)) return prev
                                                   else return [...prev, file]
                                               })
                                           })
                                           e.target.value = ''
                                       }}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBModalBody>
                    <MDBModalFooter style={{borderTop: 'none', justifyContent: 'center'}}>
                        <MDBBtn color={'dark'} size={'sm'} onClick={() => {
                            aws(uploadedFiles)
                            toggleShow()
                        }}>의뢰하기</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RequestModal
