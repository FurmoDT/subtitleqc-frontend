import {useEffect, useState} from 'react';
import ProjectModalContent from "./ProjectModalContent";
import {MDBModal, MDBModalDialog} from "mdb-react-ui-kit";


const ModifyModal = ({projectId, setProjectId}) => {
    const [show, setShow] = useState(false)
    const toggleShow = () => setShow(!show)

    useEffect(() => {
        if (projectId) setShow(true)
    }, [projectId])

    useEffect(() => {
        if (!show) setProjectId(null)
    }, [show, setProjectId])

    return <>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '900px'}}>
                <ProjectModalContent show={show} toggleShow={toggleShow} projectId={projectId}/>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ModifyModal
