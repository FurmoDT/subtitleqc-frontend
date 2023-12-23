import {useCallback, useEffect, useRef} from 'react';
import {MDBBtn, MDBListGroup, MDBListGroupItem,} from 'mdb-react-ui-kit';
import {fileType} from "../../../utils/functions";

const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}
const baseStyle = {borderStyle: 'none'};
const dragStyle = {borderStyle: 'dashed', borderColor: '#2196f3'};

let counter = 0

const TaskDropzone = ({uploadedFiles, setUploadedFiles, multiple}) => {
    const dropzoneRef = useRef(null)
    const fileInputRef = useRef(null)

    const uploadFilesHandler = useCallback((files) => {
        Array.from(files).forEach((file) => {
            if (!fileType(file.name)) return
            setUploadedFiles(prev => {
                if (prev.map(value => value.name).includes(file.name)) return prev
                else {
                    if (multiple) return [...prev, file]
                    else return [file]
                }
            })
        })
    }, [multiple, setUploadedFiles])

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
        uploadFilesHandler(e.dataTransfer.files)
    }, [uploadFilesHandler])
    const handleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.className.includes('btn-close')) {
            fileInputRef.current.files = new DataTransfer().files
            setUploadedFiles(prevState => [...prevState.filter((value) => value.name !== e.target.parentElement.innerText)])
            return
        }
        Object.assign(dropzoneRef.current.style, dragStyle);
        fileInputRef.current.click()
        setTimeout(() => Object.assign(dropzoneRef.current.style, baseStyle), 100);
    }, [setUploadedFiles])

    useEffect(() => {
        Object.assign(dropzoneRef.current.style, baseStyle)
        dropzoneRef.current.addEventListener('dragenter', handleDragEnter)
        dropzoneRef.current.addEventListener('dragover', handleDragOver)
        dropzoneRef.current.addEventListener('dragleave', handleDragLeave)
        dropzoneRef.current.addEventListener('drop', handleDrop)
        dropzoneRef.current.addEventListener('click', handleClick)
    }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleClick])

    return <>
        <MDBListGroup ref={dropzoneRef} numbered={multiple} className={'bg-white text-start rounded overflow-auto'}
                      style={{height: '6rem'}}>
            {uploadedFiles.length ? uploadedFiles.map((value) => <MDBListGroupItem key={value.name}
                                                                                   className={'px-2 py-0'}>{value.name}
                <MDBBtn className='btn-close position-absolute end-0' color='none' onClick={handleClick}/>
            </MDBListGroupItem>) : <label className={'text-start px-2'} style={{...labelStyle}}>
                파일 업로드 또는 드래그앤드롭 (2GB 미만 영상: .mp4, .mov / 문서: .pdf, .docx)</label>}
        </MDBListGroup>
        <input ref={fileInputRef} className={'d-none'} multiple={multiple} type={'file'}
               onChange={(e) => uploadFilesHandler(e.target.files)}/>
    </>
}

export default TaskDropzone
