import {
    MDBBtn,
    MDBCol,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBIcon,
    MDBInput,
    MDBInputGroup,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
    MDBRow,
} from 'mdb-react-ui-kit';
import {useEffect, useRef, useState} from "react";
import {clients} from "../../../utils/config";

const ProjectSettingModal = (props) => {
    const projectNameRef = useRef(null)
    const clientRef = useRef(null)
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const clientDropdowns = Object.entries(clients).map(([key, value]) => (
        <MDBDropdownItem link key={key} onClick={() => handleAddClick(key, value)}>{value.name}</MDBDropdownItem>))
    const handleAddClick = (key, value) => {
        clientRef.current.value = value.name
    }
    useEffect(() => {
        localStorage.setItem('projectDetail', JSON.stringify(props.projectDetail))
    }, [props.projectDetail])
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
            toggleShow()
        }}>
            <MDBIcon fas icon="info-circle" size={'2x'}/>
        </MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop onShow={() => {
            projectNameRef.current.value = props.projectDetail.name || ''
            clientRef.current.value = props.projectDetail.client || ''
        }}>
            <MDBModalDialog size={'lg'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Setting</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <MDBRow>
                            <MDBCol>
                                <h6 className='bg-light p-2 border-top border-bottom'>PROJECT NAME</h6>
                                <MDBInput ref={projectNameRef} type='text'/>
                            </MDBCol>
                            <MDBCol>
                                <h6 className='bg-light p-2 border-top border-bottom'>CLIENT</h6>
                                <MDBInputGroup className='mb-3'>
                                    <input ref={clientRef} className='form-control' type='text' disabled/>
                                    <MDBDropdown>
                                        <MDBDropdownToggle color={'link'} style={{height: '100%'}}/>
                                        <MDBDropdownMenu>
                                            {clientDropdowns}
                                        </MDBDropdownMenu>
                                    </MDBDropdown>
                                </MDBInputGroup>
                            </MDBCol>
                        </MDBRow>
                        <h6 className='bg-light p-2 border-top border-bottom'>MECHANICAL RULE</h6>
                        <h6 className='bg-light p-2 border-top border-bottom'>LANGUAGE TAB</h6>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={() => {
                            props.setProjectDetail({
                                ...props.projectDetail,
                                name: projectNameRef.current.value,
                                client: clientRef.current.value,
                                guideline: {}
                            })
                            toggleShow()
                        }}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ProjectSettingModal
