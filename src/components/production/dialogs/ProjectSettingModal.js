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
    MDBTabs,
    MDBTabsContent,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane,
} from 'mdb-react-ui-kit';
import {useEffect, useRef, useState} from "react";
import {clients} from "../../../utils/config";

const ProjectSettingModal = (props) => {
    const projectNameRef = useRef(null)
    const clientRef = useRef(null)
    const [projectDetail, setProjectDetail] = useState(props.projectDetail)
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const [fillActive, setFillActive] = useState(null);
    const handleFillClick = (value) => {
        if (value === fillActive) return
        setFillActive(value)
    }
    const clientDropdowns = Object.entries(clients).map(([key, value]) => (
        <MDBDropdownItem link key={key} onClick={() => setProjectDetail({
            ...projectDetail,
            guideline: value
        })}>{value.client}</MDBDropdownItem>))
    useEffect(() => {
        localStorage.setItem('projectDetail', JSON.stringify(props.projectDetail))
    }, [props.projectDetail])
    useEffect(() => {
        clientRef.current.value = projectDetail.guideline.client
        setFillActive(Object.keys(projectDetail.guideline.language)[0])
    }, [projectDetail])
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={toggleShow}>
            <MDBIcon fas icon="info-circle" size={'2x'}/>
        </MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop onShow={() => {
            projectNameRef.current.value = projectDetail.name
            clientRef.current.value = projectDetail.guideline.client
        }} onHide={() => setProjectDetail(props.projectDetail)}>
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
                                <MDBInput onInput={() => {
                                    setProjectDetail({...projectDetail, name: projectNameRef.current.value})
                                }} ref={projectNameRef} type='text'/>
                            </MDBCol>
                            <MDBCol>
                                <h6 className='bg-light p-2 border-top border-bottom'>CLIENT</h6>
                                <MDBInputGroup className='mb-3'>
                                    <input ref={clientRef} className='form-control' type='text' disabled/>
                                    <MDBDropdown>
                                        <MDBDropdownToggle color={'link'} style={{height: '100%'}}/>
                                        <MDBDropdownMenu responsive={'end'}>
                                            {clientDropdowns}
                                        </MDBDropdownMenu>
                                    </MDBDropdown>
                                </MDBInputGroup>
                            </MDBCol>
                        </MDBRow>
                        <h6 className='bg-light p-2 border-top border-bottom'>MECHANICAL RULE</h6>
                        <MDBTabs fill className='mb-3'>
                            {Object.entries(projectDetail.guideline.language)?.map(([key, value]) => {
                                return <MDBTabsItem key={key}><MDBTabsLink onClick={() => handleFillClick(key)}
                                                                           active={fillActive === key}>{value.name}
                                </MDBTabsLink></MDBTabsItem>
                            })}
                        </MDBTabs>
                        <MDBTabsContent>
                            {Object.entries(projectDetail.guideline.language)?.map(([key, value]) => {
                                return <MDBTabsPane key={key} show={fillActive === key}>{value.name}</MDBTabsPane>
                            })}
                        </MDBTabsContent>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={() => {
                            props.setProjectDetail({
                                ...props.projectDetail,
                                name: projectDetail.name,
                                guideline: projectDetail.guideline
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
