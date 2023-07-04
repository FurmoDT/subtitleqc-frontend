import {forwardRef, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {MDBBtn, MDBCol, MDBInput, MDBModalBody, MDBModalContent, MDBModalHeader, MDBRow,} from 'mdb-react-ui-kit';
import Select from "react-select";
import axios from "../../../../utils/axios";
import {CustomControl, CustomOption, customStyle} from "../../../../utils/customSelect";
import DatePicker from "react-datepicker";
import {languageSelectOption, workTypeSelectOption} from "../../../../utils/config";
import TaskDropzone from "../TaskDropzone";
import {AuthContext} from "../../../../utils/authContext";
import {ko} from 'date-fns/esm/locale';

const inputStyle = {backgroundColor: 'white', color: 'black'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem'}
const TaskModalContent = (props) => {
    const [task, setTask] = useState({})
    const [workers, setWorkers] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [workerListOption, setWorkerListOption] = useState([])
    const [pmListOption, setPmListOption] = useState([])
    const {userState} = useContext(AuthContext)
    const projectCodeRef = useRef(null)
    const projectGroupRef = useRef(null)
    const programNameRef = useRef(null)
    const episodeRef = useRef(null)
    const genreRef = useRef(null)

    const CustomInput = forwardRef(({value, onClick, label}, ref) => {
        return <MDBInput style={inputStyle} label={label} labelStyle={labelStyle} onClick={onClick} value={value}/>
    })

    const setProjectInfo = useCallback((value) => {
        const reset = () => {
            setTask(prevState => {
                const {projectInfo, ...rest} = prevState
                return rest
            })
            projectCodeRef.current.value = ''
        }
        if (!/^\d{8}-\d{2}$/.test(value)) {
            reset()
            return
        }
        axios.get(`/v1/project/`, {params: {project_code: value}}).then((response) => {
            setTask(prevState => ({
                ...prevState,
                projectInfo: {
                    projectId: response.data.project_id,
                    projectName: response.data.project_name,
                    clientId: response.data.client_id,
                    clientName: response.data.client_name,
                }
            }))
        }).catch(reset)
    }, [])

    useEffect(() => {
        axios.get(`/v1/user/workers`).then((response) => {
            setWorkerListOption(response.data.map(value => ({
                value: value.user_id,
                label: value.user_name,
                email: value.user_email
            })))
        })
        axios.get(`/v1/user/pm`).then((response) => {
            setPmListOption(response.data.map(value => ({
                value: value.user_id,
                label: value.user_name,
                email: value.user_email
            })))
        })
    }, [])

    useEffect(() => {
        if (!props.show) {
            projectCodeRef.current.value = projectGroupRef.current.value = programNameRef.current.value = genreRef.current.value = episodeRef.current.value = ''
            setTask({})
            setWorkers([])
            return
        }
        if (props.taskId) {
            //TODO axios.get('/v1/project/task', params: {task_id: props.task_id}).then((response) => {setProjectInfo() && setWorkers()})
        } else {
            setWorkers([{}])
        }
    }, [props.show, props.taskId])

    useEffect(() => {
        if (!props.show || pmListOption.length === 0 || props.taskId) return
        setTask(prevState => ({...prevState, pd: [pmListOption.find(value => value.value === userState.user.userId)]}))
    }, [props.show, props.taskId, pmListOption, userState])

    return <MDBModalContent style={{backgroundColor: 'transparent'}}>
        <MDBModalHeader style={{borderBottom: 'none', backgroundColor: '#f28720ff'}}>
            <MDBBtn className='btn-close' color='none' onClick={props.toggleShow}/>
        </MDBModalHeader>
        <MDBModalBody style={{backgroundColor: '#f28720ff'}}>
            <MDBRow className={'mb-3'}
                    style={{backgroundColor: '#f3f3f3ff', margin: 'inherit', padding: '1rem 0'}}>
                <label className={'mb-3'} style={{textAlign: 'left', fontWeight: 'bold'}}>태스크 정보</label>
                <MDBRow>
                    <MDBCol size={4}>
                        <MDBRow className={'mb-3'}>
                            <MDBCol style={{minWidth: '155px', maxWidth: '155px'}}>
                                <MDBInput ref={projectCodeRef} style={inputStyle} label={'프로젝트 코드'}
                                          labelStyle={labelStyle}
                                          onBlur={(event) => setProjectInfo(event.target.value)}/>
                            </MDBCol>
                            <MDBCol>
                                <MDBInput label={'클라이언트명'} labelStyle={labelStyle} disabled
                                          value={task.projectInfo?.clientName || ''}
                                          style={{textOverflow: 'ellipsis', pointerEvents: 'none'}}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol style={{display: 'flex'}}>
                                {task.pd && <Select styles={customStyle} options={pmListOption} placeholder={null}
                                                    components={{Option: CustomOption, Control: CustomControl}}
                                                    isMulti isClearable={false} defaultValue={task.pd}
                                                    onChange={(newValue) => {
                                                        setTask(prevState => ({...prevState, pd: newValue}))
                                                    }}/>}
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                    <MDBCol>
                        <MDBRow className={'mb-3'}>
                            <MDBCol>
                                <MDBInput label={'프로젝트명'} labelStyle={labelStyle} disabled
                                          value={task.projectInfo?.projectName || ''}
                                          style={{textOverflow: 'ellipsis', pointerEvents: 'none'}}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <MDBInput ref={projectGroupRef} style={inputStyle} label={'프로젝트 그룹'}
                                          labelStyle={labelStyle}
                                          onBlur={(event) => task.projectGroup = event.target.value}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <MDBInput ref={programNameRef} style={inputStyle} label={'*프로그램명'}
                                          labelStyle={labelStyle}
                                          onBlur={(event) => task.programName = event.target.value}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                    <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                        <MDBRow className={'mb-3'}>
                            <MDBCol>
                                <DatePicker customInput={<CustomInput label={'*납품기한'}/>} locale={ko}
                                            selected={task.dueDate} showTimeSelect
                                            timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                            onChange={(date) => setTask(prevState => ({
                                                ...prevState, dueDate: date.getTime()
                                            }))}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <MDBInput ref={episodeRef} style={inputStyle} label={'*에피소드'} labelStyle={labelStyle}
                                          onBlur={(event) => task.episode = event.target.value}/>
                            </MDBCol>
                            <MDBCol>
                                <MDBInput ref={genreRef} style={inputStyle} label={'장르'} labelStyle={labelStyle}
                                          onBlur={(event) => task.genre = event.target.value}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                </MDBRow>
            </MDBRow>
            <MDBRow className={'mb-3 m-0 py-3 px-0'} style={{backgroundColor: '#f3f3f3ff'}}>
                <label className={'mb-3'} style={{textAlign: 'left', fontWeight: 'bold'}}>작업자 배정</label>
                {workers.map((value, index) => {
                    return <MDBRow key={index} className={'mb-3 align-items-center m-0 p-0'}>
                        <MDBCol style={{display: 'flex'}}>
                            <Select className={'me-2'} styles={customStyle} options={workTypeSelectOption}
                                    placeholder={'*유형'}
                                    onChange={(newValue) => {
                                        setWorkers(prevState => {
                                            prevState[index].workType = newValue.value
                                            return [...prevState]
                                        })
                                    }}/>
                            {/^(대본|싱크)$/.test(workers[index].workType) ? null :
                                <Select className={'me-2'} styles={customStyle}
                                        options={languageSelectOption} placeholder={'*언어'}
                                        onChange={(newValue) => {
                                            setWorkers(prevState => {
                                                prevState[index].sourceLanguage = newValue.value
                                                return [...prevState]
                                            })
                                        }}/>}
                            <Select className={'me-2'} styles={customStyle} options={languageSelectOption}
                                    placeholder={'*언어'} onChange={(newValue) => {
                                setWorkers(prevState => {
                                    prevState[index].targetLanguage = newValue.value
                                    return [...prevState]
                                })
                            }}/>
                        </MDBCol>
                        <MDBCol size={2}>
                            <Select styles={customStyle} options={workerListOption} placeholder={'*작업자 이름'}
                                    components={{Option: CustomOption}} onChange={(newValue) => {
                                setWorkers(prevState => {
                                    prevState[index].workerId = newValue.value
                                    return [...prevState]
                                })
                            }}/>
                        </MDBCol>
                        <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                            <DatePicker customInput={<CustomInput label={'*마감일'}/>} locale={ko}
                                        selected={workers[index].dueDate} showTimeSelect
                                        timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                        onChange={(date) => {
                                            setWorkers(prevState => {
                                                prevState[index].dueDate = date.getTime()
                                                return [...prevState]
                                            })
                                        }}/>
                        </MDBCol>
                        <MDBCol>
                            <MDBInput style={inputStyle} labelStyle={labelStyle} label={'요청 사항'}
                                      onChange={(event) => {
                                          workers[index].memo = event.target.value
                                      }}/>
                        </MDBCol>
                        <MDBBtn className='btn-close' color='none'
                                style={{marginRight: 'calc(0.75rem + 1px)'}}
                                onClick={() => setWorkers(prevState => {
                                    prevState.splice(index, 1)
                                    return [...prevState]
                                })}/>
                    </MDBRow>
                })}
                <MDBBtn color={'link'} style={{
                    backgroundColor: 'white',
                    width: 'auto',
                    margin: '1rem 0.75rem',
                    marginTop: 0,
                }} onClick={() => setWorkers(prevState => [...prevState, {}])}>+ 추가하기</MDBBtn>
                <MDBRow className={'mb-3 align-items-center m-0 p-0'}>
                    <MDBCol>
                        <TaskDropzone uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                                      multiple={false}/>
                    </MDBCol>
                </MDBRow>
                <MDBCol>
                    <MDBBtn color={'dark'} onClick={() => {
                        if (!(task.dueDate && task.pd && task.programName && task.episode)) {
                            console.log('insufficient task information')
                        }
                        if (workers.filter(value => !(value.workType && (/^(대본|싱크)$/.test(value.workType) ? value.targetLanguage : value.sourceLanguage && value.targetLanguage) && value.workerId && value.dueDate)).length !== 0) {
                            console.log('insufficient worker information')
                        }
                        // aws(uploadedFiles)
                        // props.toggleShow()
                        // console.log(task, workers)
                    }}>확인</MDBBtn>
                </MDBCol>
            </MDBRow>
        </MDBModalBody>
    </MDBModalContent>
}

export default TaskModalContent
