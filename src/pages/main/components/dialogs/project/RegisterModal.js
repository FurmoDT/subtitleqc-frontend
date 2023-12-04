import {useState} from 'react';
import {MDBBtn, MDBModal, MDBModalDialog} from "mdb-react-ui-kit";
import ProjectModalContent from "./ProjectModalContent";


const RegisterModal = ({forceRender}) => {
    const [show, setShow] = useState(false);
    const toggleShow = () => setShow(!show)

    return <>
        <MDBBtn className={'bg-main'} color={'link'} onClick={toggleShow}>
            프로젝트 등록
        </MDBBtn>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '1200px'}}>
                <ProjectModalContent show={show} toggleShow={toggleShow}/>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RegisterModal
