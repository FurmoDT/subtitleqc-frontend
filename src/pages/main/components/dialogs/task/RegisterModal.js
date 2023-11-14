import {useState} from 'react';
import TaskModalContent from "./TaskModalContent";
import {MDBBtn, MDBModal, MDBModalDialog} from "mdb-react-ui-kit";


const RegisterModal = ({forceRender}) => {
    const [show, setShow] = useState(false);
    const toggleShow = () => setShow(!show)

    return <>
        <MDBBtn className={'bg-furmo'} style={{color: 'black'}} onClick={toggleShow}>
            신규 태스크 등록
        </MDBBtn>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '900px'}}>
                <TaskModalContent toggleShow={toggleShow} show={show} forceRenderer={forceRender}/>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RegisterModal