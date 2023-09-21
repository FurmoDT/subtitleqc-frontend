import {useState} from 'react';
import {MDBBtn, MDBModal, MDBModalDialog} from "mdb-react-ui-kit";
import ProjectModalContent from "./ProjectModalContent";


const RegisterModal = ({forceRender}) => {
    const [show, setShow] = useState(false);
    const toggleShow = () => setShow(!show)

    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black'}} onClick={toggleShow}>
            프로젝트 등록
        </MDBBtn>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '900px'}}>
                <ProjectModalContent toggleShow={toggleShow} show={show}/>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RegisterModal
