import {
    MDBBadge,
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
    MDBRange,
    MDBRow,
    MDBTabs,
    MDBTabsContent,
    MDBTabsItem,
    MDBTabsLink,
    MDBTabsPane,
} from 'mdb-react-ui-kit';
import {useEffect, useRef, useState} from "react";
import {guidelines} from "../../../../utils/config";

const LEVEL = {required: 2, optional: 1, none: 0, 2: 'required', 1: 'optional', 0: 'none', undefined: 0}

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
    const handleGuidelineChange = (key, value, level) => {
        const newProjectDetail = JSON.parse(JSON.stringify(projectDetail))
        if (!newProjectDetail.guideline[key]) newProjectDetail.guideline[key] = {}
        if (value) Object.assign(newProjectDetail.guideline[key], value)
        if (level !== null) newProjectDetail.guideline[key].level = LEVEL[level]
        setProjectDetail(newProjectDetail)
    }
    const handleLanguageGuidelineChange = (language, key, value, level) => {
        const newProjectDetail = JSON.parse(JSON.stringify(projectDetail))
        if (!newProjectDetail.guideline.language[language][key]) newProjectDetail.guideline.language[language][key] = {}
        if (value) Object.assign(newProjectDetail.guideline.language[language][key], value)
        if (level !== null) newProjectDetail.guideline.language[language][key].level = LEVEL[level]
        setProjectDetail(newProjectDetail)
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
                document.getElementById(`${fillActive}-maxLineInput`).value = projectDetail.guideline.language[fillActive].maxLine?.value || 0
                document.getElementById(`${fillActive}-maxLineRange`).value = LEVEL[projectDetail.guideline.language[fillActive].maxLine?.level]
                document.getElementById(`${fillActive}-maxCharacterInput`).value = projectDetail.guideline.language[fillActive].maxCharacter?.value || 0
                document.getElementById(`${fillActive}-maxCharacterRange`).value = LEVEL[projectDetail.guideline.language[fillActive].maxCharacter?.level]
                document.getElementById(`${fillActive}-cpsInput`).value = projectDetail.guideline.language[fillActive].cps?.value || 0
                document.getElementById(`${fillActive}-cpsRange`).value = LEVEL[projectDetail.guideline.language[fillActive].cps?.level]
                document.getElementById('tcRangeMinInput').value = projectDetail.guideline.tcRange?.min || null
                document.getElementById('tcRangeMaxInput').value = projectDetail.guideline.tcRange?.max || null
                document.getElementById('tcRangeRange').value = LEVEL[projectDetail.guideline.tcRange?.level]
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
                                <h6 className='bg-light p-2 border-top border-bottom'>Project Name</h6>
                                <MDBInput onInput={() => {
                                    setProjectDetail({...projectDetail, name: projectNameRef.current.value})
                                }} ref={projectNameRef} type='text'/>
                            </MDBCol>
                            <MDBCol>
                                <h6 className='bg-light p-2 border-top border-bottom'>Client</h6>
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
                        <h6 className='bg-light p-2 border-top border-bottom'>Mechanical Rule{<span
                            style={{float: "right"}}>None&emsp;-&emsp;Optional&emsp;-&emsp;Required</span>}</h6>
                        <MDBRow className={'mb-2'}>
                            <MDBCol style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} size={4}>
                                <MDBInputGroup>
                                    <input id={'tcRangeMinInput'} className='form-control'
                                           type='text' placeholder={'Min'} style={{textAlign: 'center'}}
                                           onChange={(event) => handleGuidelineChange('tcRange', {min: parseInt(event.target.value)}, null)}/>
                                    <span style={{alignItems: 'center', fontSize: '15px'}}
                                          className='input-group-text mx-n1'>TC</span>
                                    <input id={'tcRangeMaxInput'} className='form-control'
                                           type='text' placeholder={'Max'} style={{textAlign: 'center'}}
                                           onChange={(event) => handleGuidelineChange('tcRange', {max: parseInt(event.target.value)}, null)}/>
                                </MDBInputGroup>
                                <MDBRange id={'tcRangeRange'} className={'mx-sm-2'}
                                          style={{display: 'flex'}}
                                          disableTooltip={true} min={0} max={2} step={1}
                                          onChange={(event) => handleGuidelineChange('tcRange', null, parseInt(event.target.value))}/>
                            </MDBCol>
                            <MDBCol style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={8}>
                                <div className={'px-2 py-1 bg-info bg-opacity-25 rounded'}
                                     style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                    <h5 style={{margin: 0}}><MDBBadge color={'info'}>Music</MDBBadge></h5>
                                    <h6 className='mx-2' style={{margin: 0}}><b>{projectDetail.guideline.musicNote}</b>
                                    </h6>
                                </div>
                            </MDBCol>
                        </MDBRow>
                        <p className='border-1 border'/>
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
                                    <MDBRow className={'mb-4'}>
                                        <MDBCol style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                            <MDBInput id={`${key}-maxLineInput`} label='MaxLine' type='number'
                                                      disabled={projectDetail.guideline.client !== 'CUSTOM'}
                                                      defaultValue={0}
                                                      onChange={(event) => handleLanguageGuidelineChange(key, 'maxLine', {value: parseInt(event.target.value)}, null)}/>
                                            <MDBRange id={`${key}-maxLineRange`} className={'mx-sm-2'}
                                                      style={{display: 'flex'}}
                                                      disabled={projectDetail.guideline.client !== 'CUSTOM'}
                                                      disableTooltip={true} min={0} max={2} step={1}
                                                      onChange={(event) => handleLanguageGuidelineChange(key, 'maxLine', null, parseInt(event.target.value))}/>
                                        </MDBCol>
                                        <MDBCol style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                            <MDBInput id={`${key}-maxCharacterInput`} label='MaxCharacter' type='number'
                                                      disabled={projectDetail.guideline.client !== 'CUSTOM'}
                                                      defaultValue={0}
                                                      onChange={(event) => handleLanguageGuidelineChange(key, 'maxCharacter', {value: parseInt(event.target.value)}, null)}/>
                                            <MDBRange id={`${key}-maxCharacterRange`} className={'mx-sm-2'}
                                                      style={{display: 'flex'}}
                                                      disabled={projectDetail.guideline.client !== 'CUSTOM'}
                                                      disableTooltip={true} min={0} max={2} step={1}
                                                      onChange={(event) => handleLanguageGuidelineChange(key, 'maxCharacter', null, parseInt(event.target.value))}/>
                                        </MDBCol>
                                        <MDBCol style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                            <MDBInput id={`${key}-cpsInput`} label='CPS' type='number'
                                                      defaultValue={0}
                                                      onChange={(event) => handleLanguageGuidelineChange(key, 'cps', {value: parseInt(event.target.value)}, null)}/>
                                            <MDBRange id={`${key}-cpsRange`} className={'mx-sm-2'}
                                                      style={{display: 'flex'}}
                                                      disableTooltip={true} min={0} max={2} step={1}
                                                      onChange={(event) => handleLanguageGuidelineChange(key, 'cps', null, parseInt(event.target.value))}/>
                                        </MDBCol>
                                    </MDBRow>
                                    <MDBRow className={'mb-2'}>
                                        <MDBCol style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}} size={4}>
                                            <div className={'px-2 py-1 bg-info bg-opacity-25 rounded'}
                                                 style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <h5 style={{margin: 0}}>
                                                    <MDBBadge color={'info'}>Parenthesis</MDBBadge>
                                                </h5>
                                                <h6 className='mx-2' style={{margin: 0}}><b>{
                                                    ['()', '[]', '（）'].filter(value => value.match(projectDetail.guideline.language[key].parenthesis?.regex))
                                                }</b></h6>
                                            </div>
                                        </MDBCol>
                                        <MDBCol
                                            style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                            size={4}>
                                            <div className={'px-2 py-1 bg-info bg-opacity-25 rounded'}
                                                 style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                <h5 style={{margin: 0}}><MDBBadge color={'info'}>Dialog</MDBBadge>
                                                </h5>
                                                <h6 className='mx-2' style={{margin: 0, whiteSpace: 'pre-wrap'}}>{
                                                    projectDetail.guideline.language[key].dialog?.sample?.replace(/ /g, '\u00a0')
                                                }</h6>
                                            </div>
                                        </MDBCol>
                                    </MDBRow>
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
