import {useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBInput,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBRow,
    MDBTextArea,
} from 'mdb-react-ui-kit';
import TaskDropzone from "../TaskDropzone";

const inputStyle = {backgroundColor: 'white'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}

const RequestModal = () => {
    const [basicModal, setBasicModal] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([])
    const toggleShow = () => setBasicModal(!basicModal);
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
                                <TaskDropzone uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                                              multiple={true}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBModalBody>
                    <MDBModalFooter style={{borderTop: 'none', justifyContent: 'center'}}>
                        <MDBBtn color={'dark'} size={'sm'} onClick={() => {
                            // aws(uploadedFiles)
                            toggleShow()
                        }}>의뢰하기</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RequestModal
