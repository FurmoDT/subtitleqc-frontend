import {useState} from 'react';
import {
    MDBBtn,
    MDBIcon,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';

const ShortcutModal = () => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
            toggleShow()
        }}><MDBIcon fas icon="keyboard" size={'2x'}/></MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'lg'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Shortcut</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <h6 className='bg-light p-2 border-top border-bottom'>VIDEO</h6>
                        <MDBListGroup light small>
                            <MDBListGroupItem>
                                이동
                            </MDBListGroupItem>
                            <MDBListGroupItem>
                                배속
                            </MDBListGroupItem>
                        </MDBListGroup>
                        <h6 className='bg-light p-2 border-top border-bottom'>Subtitle</h6>
                        <MDBListGroup light small>
                            <MDBListGroupItem>
                                실행 취소
                            </MDBListGroupItem>
                            <MDBListGroupItem>
                                다시 실행
                            </MDBListGroupItem>
                        </MDBListGroup>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={toggleShow}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ShortcutModal
