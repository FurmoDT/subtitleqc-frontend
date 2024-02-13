import {useState} from 'react';
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
import {FaUserCheck} from "react-icons/fa6";
import {BsCheckCircleFill} from "react-icons/bs";
import axios from "../../../../utils/axios";
import {useNavigate} from 'react-router-dom';
import {s3UploadWork} from "../../../../utils/aws/s3";
import {toFspx} from "../../../../utils/fileParser";

const SubmitModal = ({taskHashedId, workHashedId, fileData}) => {
    const [basicModal, setBasicModal] = useState(false);
    const navigate = useNavigate();
    const toggleShow = () => setBasicModal(!basicModal);

    return <>
        <MDBBtn size={'sm'} className={'mx-1'} color={'link'}>
            <FaUserCheck size={25} color={'blue'} onClick={toggleShow}/>
        </MDBBtn>
        <MDBModal show={basicModal} tabIndex='-1'>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle className={'d-flex align-items-center'}>
                            <BsCheckCircleFill size={25} color={'green'}/>
                            <label style={{fontSize: '1.125rem'}} className={'mx-1 fw-bold'}>작업 완료</label>
                        </MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>작업을 완료하면<br/>더 이상 수정할 수 없습니다.</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>취소</MDBBtn>
                        <MDBBtn onClick={async () => {
                            const currentTime = new Date().getTime()
                            await s3UploadWork(taskHashedId, workHashedId, currentTime, toFspx(fileData))
                            axios.post(`v1/works/done/${workHashedId}`, {work_ended_at: currentTime}).then(() => navigate('/'))
                        }}>확인</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default SubmitModal
