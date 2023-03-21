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
import {guidelines} from "../../../utils/config";

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
    const clientDropdowns = Object.entries(guidelines).map(([key, value]) => (
        <MDBDropdownItem link key={key} onClick={() => {
            setFillActive(null)
            setProjectDetail({
                ...projectDetail,
                guideline: value
            })
        }}>{value.client}</MDBDropdownItem>))
    const handleSettingChange = (language, key, value) => {
        setProjectDetail({
            ...projectDetail,
            guideline: {
                ...projectDetail.guideline,
                language: {
                    ...projectDetail.guideline.language,
                    [language]: {
                        ...projectDetail.guideline.language[language],
                        [key]: value
                    }
                }
            }
        })
    }
    useEffect(() => {
        setProjectDetail(props.projectDetail)
        localStorage.setItem('projectDetail', JSON.stringify(props.projectDetail))
    }, [props.projectDetail])
    useEffect(() => {
        projectNameRef.current.value = projectDetail.name
        clientRef.current.value = projectDetail.guideline.client
        if (basicModal) {
            if (fillActive === null) setFillActive(Object.keys(projectDetail.guideline.language)[0])
            if (fillActive) {
                document.getElementById('maxLineInput').value = projectDetail.guideline.language[fillActive].maxLine
                document.getElementById('maxCharacterInput').value = projectDetail.guideline.language[fillActive].maxCharacter
                document.getElementById('cpsInput').value = projectDetail.guideline.language[fillActive].cps
            }
        }
    }, [projectDetail, basicModal, fillActive])
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={toggleShow}>
            <MDBIcon fas icon="info-circle" size={'2x'}/>
        </MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop
                  onHide={() => {
                      setFillActive(null)
                      setProjectDetail(props.projectDetail)
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
                            {Object.entries(projectDetail.guideline.language)?.map(([key, value]) => (
                                <MDBTabsPane key={key} show={fillActive === key}>
                                    <div>
                                        <MDBRow className={'mb-4'}>
                                            <MDBCol>
                                                <MDBInput id={'maxLineInput'} label='MaxLine' type='number'
                                                          defaultValue={value.maxLine}
                                                          onChange={(event) => handleSettingChange(key, 'maxLine', parseInt(event.target.value))}/>
                                            </MDBCol>
                                            <MDBCol>
                                                <MDBInput id={'maxCharacterInput'} label='MaxCharacter' type='number'
                                                          defaultValue={value.maxCharacter}
                                                          onChange={(event) => handleSettingChange(key, 'maxCharacter', parseInt(event.target.value))}/>
                                            </MDBCol>
                                        </MDBRow>
                                        <MDBRow className={'mb-4'}>
                                            <MDBCol size={3}>
                                                <MDBInput id={'cpsInput'} label='CPS' type='number'
                                                          defaultValue={value.cps}
                                                          onChange={(event) => handleSettingChange(key, 'cps', parseInt(event.target.value))}/>
                                            </MDBCol>
                                        </MDBRow>
                                    </div>
                                </MDBTabsPane>
                            ))}
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
