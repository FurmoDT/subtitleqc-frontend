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
import {MdDone} from "react-icons/md";

const TaskDoneModal = ({hashedId, setHashedId, forceRenderer}) => {
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
                            <MdDone size={25} color={'green'}/>
                            <label style={{fontSize: '1.125rem'}} className={'mx-1 fw-bold'}>태스크 완료</label>
                        </MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>태스크를 완료하면<br/>더 이상 수정할 수 없습니다.</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>취소</MDBBtn>
                        <MDBBtn onClick={() => {
                            axios.post(`v1/tasks/done/${hashedId}`, {task_ended_at: new Date().getTime()}).then(() => {
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

export default TaskDoneModal
