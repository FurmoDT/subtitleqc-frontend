import {useState} from 'react';
import {
    MDBBtn,
    MDBIcon,
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
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Shortcut</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        info
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
