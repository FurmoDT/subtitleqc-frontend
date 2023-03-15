import {
    MDBBtn,
    MDBIcon,
    MDBInput,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';
import {useEffect, useRef, useState} from "react";

const ProjectSettingModal = (props) => {
    const projectNameRef = useRef(null)
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    useEffect(() => {
        projectNameRef.current.value = props.projectDetail.name || ''
    }, [props.projectDetail])
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
            toggleShow()
        }}>
            <MDBIcon fas icon="info-circle" size={'2x'}/>
        </MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'lg'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Setting</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <h6 className='bg-light p-2 border-top border-bottom'>PROJECT NAME</h6>
                        <MDBInput ref={projectNameRef} type='text'/>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={() => {
                            const projectDetail = {...props.projectDetail, name: projectNameRef.current.value}
                            props.setProjectDetail(projectDetail)
                            localStorage.setItem('projectDetail', JSON.stringify(projectDetail))
                            toggleShow()
                        }}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ProjectSettingModal
