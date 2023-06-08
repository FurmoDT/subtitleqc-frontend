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

const inputStyle = {backgroundColor: 'white'}
const labelStyle = {fontSize: '0.75rem', lineHeight: '1.5rem', color: 'black'}

const RequestModal = () => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black', marginBottom: '0.5rem'}} onClick={toggleShow}>
            새로운 작업 의뢰하기</MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'xl'} centered>
                <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
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
                                <MDBTextArea label='파일 업로드 또는 드래그앤드랍' rows={3} style={inputStyle}
                                             labelStyle={labelStyle}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBModalBody>
                    <MDBModalFooter style={{borderTop: 'none', justifyContent: 'center'}}>
                        <MDBBtn color={'dark'} size={'sm'}>의뢰하기</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RequestModal
