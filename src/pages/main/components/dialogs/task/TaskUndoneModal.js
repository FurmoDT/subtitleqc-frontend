import {useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';
import axios from "../../../../../utils/axios";
import {MdRemove} from "react-icons/md";

const TaskUndoneModal = ({hashedId, setHashedId, forceRenderer}) => {
    const [show, setShow] = useState(false)
    const toggleShow = () => setShow(!show)

    useEffect(() => {
        if (hashedId) setShow(true)
    }, [hashedId])

    useEffect(() => {
        if (!show) setHashedId(null)
    }, [show, setHashedId])

    return <>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle className={'d-flex align-items-center'}>
                            <MdRemove size={25} color={'red'}/>
                            <label style={{fontSize: '1.125rem'}} className={'mx-1 fw-bold'}>태스크 취소</label>
                        </MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>태스크를 재진행 하시겠습니까?</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>취소</MDBBtn>
                        <MDBBtn onClick={() => {
                            axios.post(`v1/tasks/done/${hashedId}`, {task_ended_at: null}).then(() => {
                                toggleShow()
                                forceRenderer()
                            })
                        }}>확인</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default TaskUndoneModal
