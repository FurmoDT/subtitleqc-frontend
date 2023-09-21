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
import {BsCheckCircleFill} from "react-icons/bs";
import axios from "../../../../../utils/axios";

const WorkUndoneModal = ({hashedId, setHashedId, forceRenderer}) => {
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
                            <BsCheckCircleFill size={25} color={'green'}/>
                            <label style={{fontSize: '1.125rem'}} className={'mx-1 fw-bold'}>작업 취소</label>
                        </MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>작업을 재진행 하시겠습니까?</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>취소</MDBBtn>
                        <MDBBtn onClick={() => {
                            axios.post('v1/project/task/work/done', {
                                work_hashed_id: hashedId,
                                work_ended_at: null
                            }).then(() => {
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

export default WorkUndoneModal
