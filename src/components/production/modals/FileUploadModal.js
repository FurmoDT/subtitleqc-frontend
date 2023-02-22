import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';
import {useCallback} from "react";

const FileUploadModal = (props) => {
    const toggleShow = () => props.setFileUploadModalShow(!props.fileUploadModalShow);
    const setFile = useCallback((update) => {
        const subtitle = [];
        const l1 = (!props.fxToggleRef.current ? props.cellDataRef.current.length : props.fxRef.current.length)
        const l2 = props.languageFile.subtitle.length
        const maxLength = Math.max(l1, l2)
        for (let i = 0; i < maxLength; i++) {
            const {start: startA, end: endA, ...subtitleA} = (!props.fxToggleRef.current ? props.cellDataRef.current[i] : props.fxRef.current[i]) || {}
            const {start: startB, end: endB, ...subtitleB} = props.languageFile.subtitle[i] || {}
            const start = update ? startB : startA
            const end = update ? endB : endA
            subtitle.push(Object.assign({}, {...(start ? {start} : {}), ...(end ? {end} : {})}, subtitleA, subtitleB))
        }
        if (!props.fxToggleRef.current) {
            props.cellDataRef.current = subtitle
            localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            props.setLanguages(props.languageFile.language)
        } else {
            props.fxRef.current = subtitle
            localStorage.setItem('fx', JSON.stringify(props.fxRef.current))
            props.setFxLanguages(props.languageFile.language)
        }
    },[props])
    return <>
        <MDBModal staticBackdrop show={props.fileUploadModalShow} setShow={props.setFileUploadModalShow} tabIndex='-1'>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>&#x26A0;&#xFE0F;</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>TIMECODE UPDATE</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={() => {
                            toggleShow()
                            setFile(false)
                        }}>REMAIN</MDBBtn>
                        <MDBBtn onClick={() => {
                            toggleShow()
                            setFile(true)
                        }}>UPDATE</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default FileUploadModal