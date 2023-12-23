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

const WorkUndoneModal = ({workHashedId, setWorkHashedId, forceRenderer}) => {
    const [show, setShow] = useState(false)
    const toggleShow = () => setShow(!show)

    useEffect(() => {
        if (workHashedId) setShow(true)
    }, [workHashedId])

    useEffect(() => {
        if (!show) setWorkHashedId(null)
    }, [show, setWorkHashedId])

    return <>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle className={'d-flex align-items-center'}>
                            <MdRemove size={25} color={'red'}/>
                            <label style={{fontSize: '1.125rem'}} className={'mx-1 fw-bold'}>작업 취소</label>
                        </MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>작업을 재진행 하시겠습니까?</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>취소</MDBBtn>
                        <MDBBtn onClick={() => {
                            axios.post(`v1/works/done/${workHashedId}`, {work_ended_at: null}).then(() => {
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
