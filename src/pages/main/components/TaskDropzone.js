import {useCallback, useEffect, useRef} from 'react';
import {MDBBtn, MDBListGroup, MDBListGroupItem,} from 'mdb-react-ui-kit';

const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}
const baseStyle = {borderStyle: 'none', height: '6rem', overflowY: 'auto', backgroundColor: 'white'};
const dragStyle = {borderStyle: 'dashed', borderColor: '#2196f3'};

let counter = 0

const TaskDropzone = ({uploadedFiles, setUploadedFiles, multiple}) => {
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
        Array.from(e.dataTransfer.files).forEach((file) => {
            setUploadedFiles(prev => {
                if (prev.map(value => value.name).includes(file.name)) return prev
                else {
                    if (multiple) return [...prev, file]
                    else return [file]
                }
            })
        })
    }, [multiple, setUploadedFiles])
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
        <MDBListGroup ref={dropzoneRef} numbered={multiple} style={{textAlign: 'left'}}>
            {uploadedFiles.length ? uploadedFiles.map((value) => <MDBListGroupItem
                    key={value.name} style={{padding: '0 0.75rem'}}>{value.name}
                    <MDBBtn className='btn-close' color='none'
                            style={{position: 'absolute', right: 0}} onClick={handleClick}/>
                </MDBListGroupItem>) :
                <label style={{textAlign: 'left', paddingLeft: '0.75rem', ...labelStyle}}>
                    파일 업로드 또는 드래그앤드롭</label>}
        </MDBListGroup>
        <input ref={fileInputRef} style={{display: 'none'}} multiple={multiple} type={'file'}
               onChange={(e) => {
                   Array.from(e.target.files).forEach((file) => {
                       setUploadedFiles(prev => {
                           if (prev.map(value => value.name).includes(file.name)) return prev
                           else {
                               if (multiple) return [...prev, file]
                               else return [file]
                           }
                       })
                   })
               }}/>
    </>
}

export default TaskDropzone