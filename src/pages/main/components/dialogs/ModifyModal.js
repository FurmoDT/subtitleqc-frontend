import {useEffect, useState} from 'react';
import TaskModalContent from "./TaskModalContent";
import {MDBModal, MDBModalDialog} from "mdb-react-ui-kit";


const ModifyModal = ({hashedId, setHashedId}) => {
    const [show, setShow] = useState(false)
    const toggleShow = () => setShow(!show)

    useEffect(() => {
        if (hashedId) setShow(true)
    }, [hashedId])

    useEffect(()=>{
        if (!show) setHashedId(null)
    }, [show, setHashedId])

    return <>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '900px'}}>
                <TaskModalContent toggleShow={toggleShow} show={show} hashedId={hashedId}/>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ModifyModal
