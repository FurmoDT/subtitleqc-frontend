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
import {useNavigate} from 'react-router-dom';
import {BsCheckCircleFill} from "react-icons/bs";
import axios from "../../../../utils/axios";

const TaskDoneModal = ({hashedId, setHashedId}) => {
    const [show, setShow] = useState(false)
    const toggleShow = () => setShow(!show)
    const navigate = useNavigate()

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
                            <BsCheckCircleFill size={25} color={'green'}/>
                            <label style={{fontSize: '1.125rem'}} className={'mx-1 fw-bold'}>태스크 완료</label>
                        </MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>태스크를 완료하면<br/>더 이상 수정할 수 없습니다.</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>취소</MDBBtn>
                        <MDBBtn onClick={() => {
                            axios.post('v1/project/task/done', {
                                task_hashed_id: hashedId,
                                task_ended_at: new Date().getTime()
                            }).then(() => navigate('/'))
                        }}>확인</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default TaskDoneModal
