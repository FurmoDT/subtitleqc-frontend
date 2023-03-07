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
import {useState} from "react";

const ProjectSettingModal = (props) => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
            toggleShow()
        }}>
            <MDBIcon fas icon="info-circle" size={'2x'}/>
        </MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'lg'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Setting</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>Project</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ProjectSettingModal
