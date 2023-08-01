import {forwardRef, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBIcon,
    MDBInput,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalHeader,
    MDBRow,
} from 'mdb-react-ui-kit';
import Select from "react-select";
import axios from "../../../../utils/axios";
import {CustomControl, customMultiStyle, CustomOption, customStyle} from "../../../../utils/customSelect";
import DatePicker from "react-datepicker";
import {genreSelectOption, languageSelectOption, workTypeSelectOption} from "../../../../utils/config";
import TaskDropzone from "../TaskDropzone";
import {AuthContext} from "../../../../utils/authContext";
import {s3Upload} from "../../../../utils/awsS3Upload";
import {fileExtension} from "../../../../utils/functions";

const inputStyle = {backgroundColor: 'white', color: 'black'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem'}
const TaskModalContent = ({toggleShow, show, hashedId}) => {
    const [initialized, setInitialized] = useState(false)
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
    const taskValidationLabelRef = useRef(null)
    const workerValidationLabelRef = useRef(null)
    const [submitModal, setSubmitModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const submitToggleShow = () => setSubmitModal(!submitModal);
    const deleteToggleShow = () => setDeleteModal(!deleteModal);

    const inputValidation = () => {
        let error = false
        if (!(task.dueDate && task.pd && task.programName && task.episode)) {
            taskValidationLabelRef.current.innerText = '모든 필수 정보를 입력해주세요.'
            error = true
        } else taskValidationLabelRef.current.innerText = ''
        if (workers.filter(value => !(value.workType && (/^(sync|transcribe)$/.test(value.workType) ? value.targetLanguage : value.sourceLanguage && value.targetLanguage) && value.workerId && value.dueDate)).length !== 0) {
            workerValidationLabelRef.current.innerText = '모든 필수 정보를 입력해주세요.'
            error = true
        } else workerValidationLabelRef.current.innerText = ''
        if (error) return
        submitToggleShow()
    }

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
        if (!show || hashedId || pmListOption.length === 0) return
        setTask(prevState => ({...prevState, pd: [pmListOption.find(value => value.value === userState.user.userId)]}))
    }, [show, hashedId, pmListOption, userState])

    useEffect(() => {
        if (!show) {
            setInitialized(false)
            setTask({})
            setWorkers([])
            setUploadedFiles([])
            return
        }
        if (hashedId) {
            axios.get('/v1/project/task', {params: {hashed_id: hashedId}}).then((response) => {
                setTask({
                    pd: pmListOption.filter(value => Object.keys(JSON.parse(response.data.pd)).includes(`${value.value}`)),
                    projectInfo: {
                        projectId: response.data.project_id,
                        projectCode: response.data.project_code,
                        projectName: response.data.project_name,
                        clientName: response.data.client_name,
                    },
                    projectGroup: response.data.task_group_key,
                    dueDate: response.data.task_due_date,
                    programName: response.data.task_name,
                    episode: response.data.task_episode,
                    genre: response.data.task_genre,
                })
            })
            axios.get('v1/project/task/works', {params: {hashed_id: hashedId}}).then((response) => {
                response.data.map((value) => setWorkers(prevState => [...prevState,
                    {
                        workType: value.work_type,
                        sourceLanguage: value.work_source_language,
                        targetLanguage: value.work_target_language,
                        workerId: value.worker_id,
                        dueDate: value.work_due_date,
                        memo: value.work_memo
                    }]))
            })
        } else {
            setWorkers([{}])
        }
    }, [show, hashedId, pmListOption])

    useEffect(() => {
        if (Object.keys(task).length) setInitialized(true)
    }, [task])

    useEffect(() => {
        if (initialized) taskValidationLabelRef.current.innerText = workerValidationLabelRef.current.innerText = ''
    }, [initialized])

    return initialized && <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
        <MDBModalHeader style={{borderBottom: 'none'}}>
            <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBRow className={'mb-1'}
                    style={{backgroundColor: '#f3f3f3ff', margin: 'inherit', padding: '1rem 0'}}>
                <label className={'mb-3'} style={{textAlign: 'left', fontWeight: 'bold'}}>
                    태스크 정보<label ref={taskValidationLabelRef} className={'input-error-label'}/></label>
                <MDBRow>
                    <MDBCol size={4}>
                        <MDBRow className={'mb-3'}>
                            <MDBCol style={{minWidth: '155px', maxWidth: '155px'}}>
                                <MDBInput ref={projectCodeRef} style={inputStyle} label={'프로젝트 코드'}
                                          labelStyle={labelStyle} defaultValue={task.projectInfo?.projectCode}
                                          onBlur={(event) => setProjectInfo(event.target.value)}/>
                            </MDBCol>
                            <MDBCol>
                                <MDBInput label={'클라이언트명'} labelStyle={labelStyle} disabled tabIndex={-1}
                                          value={task.projectInfo?.clientName || ''}
                                          style={{textOverflow: 'ellipsis', pointerEvents: 'none'}}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol style={{display: 'flex'}}>
                                {task.pd && <Select styles={customMultiStyle} options={pmListOption} placeholder={null}
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
                                <MDBInput label={'프로젝트명'} labelStyle={labelStyle} disabled tabIndex={-1}
                                          value={task.projectInfo?.projectName || ''}
                                          style={{textOverflow: 'ellipsis', pointerEvents: 'none'}}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <MDBInput ref={projectGroupRef} style={inputStyle} label={'프로젝트 그룹'}
                                          labelStyle={labelStyle} defaultValue={task.projectGroup}
                                />
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <MDBInput ref={programNameRef} style={inputStyle} label={'*프로그램명'}
                                          labelStyle={labelStyle} defaultValue={task.programName}
                                          onBlur={(event) => task.programName = event.target.value}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <MDBInput ref={episodeRef} style={inputStyle} label={'*에피소드'} labelStyle={labelStyle}
                                          defaultValue={task.episode}
                                          onBlur={(event) => task.episode = event.target.value}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                    <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                        <MDBRow className={'mb-3'}>
                            <MDBCol>
                                <DatePicker customInput={<CustomInput label={'*납품기한'}/>}
                                            selected={task.dueDate} showTimeSelect
                                            timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                            onChange={(date) => setTask(prevState => ({
                                                ...prevState, dueDate: date.getTime()
                                            }))}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <Select ref={genreRef} styles={customStyle} options={genreSelectOption}
                                        placeholder={'장르'}
                                        value={genreSelectOption.find(value => value.value === task.genre)}
                                        onChange={(newValue) => {
                                            setTask(prevState => ({...prevState, genre: newValue}))
                                        }}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                </MDBRow>
            </MDBRow>
            <MDBRow className={'mb-3 m-0 py-3 px-0'} style={{backgroundColor: '#f3f3f3ff'}}>
                <label className={'mb-3'} style={{textAlign: 'left', fontWeight: 'bold'}}>
                    작업자 배정<label ref={workerValidationLabelRef} className={'input-error-label'}/></label>
                {workers.map((value, index) => {
                    return <MDBRow key={index} className={'mb-3 align-items-center m-0 p-0'}>
                        <MDBCol style={{display: 'flex'}}>
                            <Select className={'me-2'} styles={customStyle} options={workTypeSelectOption}
                                    placeholder={'*유형'}
                                    value={workTypeSelectOption.find(value => value.value === workers[index].workType)}
                                    onChange={(newValue) => {
                                        setWorkers(prevState => {
                                            prevState[index].workType = newValue.value
                                            return [...prevState]
                                        })
                                    }}/>
                            {/^(sync|transcribe)$/.test(workers[index].workType) ? null :
                                <Select className={'me-2'} styles={customStyle}
                                        options={languageSelectOption} placeholder={'*언어'}
                                        value={languageSelectOption.find(value => value.value === workers[index].sourceLanguage)}
                                        onChange={(newValue) => {
                                            setWorkers(prevState => {
                                                prevState[index].sourceLanguage = newValue.value
                                                return [...prevState]
                                            })
                                        }}/>}
                            <Select className={'me-2'} styles={customStyle} options={languageSelectOption}
                                    value={languageSelectOption.find(value => value.value === workers[index].targetLanguage)}
                                    placeholder={'*언어'} onChange={(newValue) => {
                                setWorkers(prevState => {
                                    prevState[index].targetLanguage = newValue.value
                                    return [...prevState]
                                })
                            }}/>
                        </MDBCol>
                        <MDBCol size={2}>
                            <Select styles={customStyle} options={workerListOption} placeholder={'*작업자 이름'}
                                    value={workerListOption.find(value => value.value === workers[index].workerId)}
                                    components={{Option: CustomOption}} onChange={(newValue) => {
                                setWorkers(prevState => {
                                    prevState[index].workerId = newValue.value
                                    return [...prevState]
                                })
                            }}/>
                        </MDBCol>
                        <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                            <DatePicker customInput={<CustomInput label={'*마감일'}/>}
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
                                      defaultValue={workers[index].memo}
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
                {!hashedId ? <MDBCol>
                    <MDBBtn color={'dark'} onClick={inputValidation}>확인</MDBBtn>
                    <MDBModal show={submitModal} setShow={setSubmitModal} tabIndex='-1'>
                        <MDBModalDialog centered>
                            <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
                                <MDBModalBody>
                                    <div style={{backgroundColor: 'white', margin: 'inherit', padding: '1rem 0'}}>
                                        <MDBRow>
                                            <MDBCol>
                                                <p>[{task.programName}_{task.episode}]</p>
                                                태스크를 생성하고 작업자 배정을 완료하시겠습니까?
                                            </MDBCol>
                                        </MDBRow>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            margin: '1rem 5rem'
                                        }}>
                                            <MDBBtn style={{backgroundColor: '#f28720ff'}} onClick={() => {
                                                submitToggleShow()
                                                toggleShow()
                                                axios.post('v1/project/task', {
                                                    project_id: task.projectInfo?.projectId,
                                                    pm_id: userState.user.userId,
                                                    pd_ids: task.pd.map(value => value.value),
                                                    task_name: task.programName,
                                                    task_episode: task.episode,
                                                    task_genre: task.genre?.value,
                                                    task_due_date: task.dueDate,
                                                    task_group_key: task.projectGroup,
                                                    task_file_extension: fileExtension(uploadedFiles[0]?.name)
                                                }).then((taskResponse) => {
                                                    const [taskId, fileVersion] = taskResponse.data
                                                    s3Upload(taskId, fileVersion, uploadedFiles)
                                                    workers.length && axios.post('v1/project/work', {
                                                        works: workers.map((value) => {
                                                            return {
                                                                task_id: taskId,
                                                                worker_id: value.workerId,
                                                                work_type: value.workType,
                                                                work_source_language: value.sourceLanguage,
                                                                work_target_language: value.targetLanguage,
                                                                work_due_date: value.dueDate,
                                                                work_memo: value.memo,
                                                            }
                                                        })
                                                    }).then()
                                                })
                                            }}>확인</MDBBtn>
                                            <MDBBtn color='dark' onClick={submitToggleShow}>취소</MDBBtn>
                                        </div>
                                    </div>
                                </MDBModalBody>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                </MDBCol> : <MDBCol>
                    <MDBBtn color={'dark'} onClick={inputValidation}>수정</MDBBtn>
                    <MDBBtn color={'link'}
                            style={{color: '#808080', paddingLeft: '0.5rem', paddingRight: '0.5rem', margin: '0 1rem'}}
                            onClick={deleteToggleShow}>
                        <MDBIcon fas icon="trash"/> 삭제
                    </MDBBtn>
                    <MDBModal show={submitModal} setShow={setSubmitModal} tabIndex='-1'>
                        <MDBModalDialog centered>
                            <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
                                <MDBModalBody>
                                    <div style={{backgroundColor: 'white', margin: 'inherit', padding: '1rem 0'}}>
                                        <MDBRow>
                                            <MDBCol>
                                                <p>[{task.programName}_{task.episode}]</p>
                                                태스크를 수정하시겠습니까?
                                            </MDBCol>
                                        </MDBRow>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            margin: '1rem 5rem'
                                        }}>
                                            <MDBBtn style={{backgroundColor: '#f28720ff'}} onClick={() => {
                                                submitToggleShow()
                                                toggleShow()
                                                // TODO update API
                                            }}>확인</MDBBtn>
                                            <MDBBtn color={'dark'} onClick={submitToggleShow}>취소</MDBBtn>
                                        </div>
                                    </div>
                                </MDBModalBody>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                    <MDBModal show={deleteModal} setShow={setDeleteModal} tabIndex='-1'>
                        <MDBModalDialog centered>
                            <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
                                <MDBModalBody>
                                    <div style={{backgroundColor: 'white', margin: 'inherit', padding: '1rem 0'}}>
                                        <MDBRow>
                                            <MDBCol>
                                                <p>[{task.programName}_{task.episode}]</p>
                                                태스크를 삭제하시겠습니까?
                                            </MDBCol>
                                        </MDBRow>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            margin: '1rem 5rem'
                                        }}>
                                            <MDBBtn style={{backgroundColor: '#f28720ff'}} onClick={() => {
                                                deleteToggleShow()
                                                toggleShow()
                                                axios.put('v1/project/task', {
                                                    task_hashed_id: hashedId,
                                                    task_deactivated: true
                                                }).then()
                                            }}>확인</MDBBtn>
                                            <MDBBtn color={'dark'} onClick={deleteToggleShow}>취소</MDBBtn>
                                        </div>
                                    </div>
                                </MDBModalBody>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                </MDBCol>}
            </MDBRow>
        </MDBModalBody>
    </MDBModalContent>
}

export default TaskModalContent
