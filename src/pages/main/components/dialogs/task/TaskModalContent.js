import {useCallback, useContext, useEffect, useRef, useState} from 'react';
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
    MDBSpinner,
} from 'mdb-react-ui-kit';
import Select from "react-select";
import axios from "../../../../../utils/axios";
import {multiStyle, PdControl, singleStyle, UserOption} from "../../../../../components/Selects";
import DatePicker from "react-datepicker";
import {genreSelectOption, languageSelectOption, workTypeSelectOption} from "../../../../../utils/config";
import TaskDropzone from "../../TaskDropzone";
import {AuthContext} from "../../../../../contexts/authContext";
import {s3Upload} from "../../../../../utils/awsS3Upload";
import {fileExtension, getFileInfo} from "../../../../../utils/functions";
import {DateInput, inputStyle, labelStyle} from "../../../../../components/Inputs";

const TaskModalContent = ({toggleShow, show, hashedId, forceRenderer}) => {
    const [initialized, setInitialized] = useState(false)
    const [task, setTask] = useState({})
    const [workers, setWorkers] = useState([])
    const [removedWorkers, setRemovedWorkers] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [workerListOption, setWorkerListOption] = useState([])
    const [pmListOption, setPmListOption] = useState([])
    const {userState} = useContext(AuthContext)
    const modifySpinnerRef = useRef(null)
    const [uploadProgress, setUploadProgress] = useState(0);
    const projectCodeRef = useRef(null)
    const taskValidationSpanRef = useRef(null)
    const workerValidationSpanRef = useRef(null)
    const [submitModal, setSubmitModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const submitToggleShow = () => setSubmitModal(!submitModal);
    const deleteToggleShow = () => setDeleteModal(!deleteModal);

    const inputValidation = () => {
        let error = false
        if (!(task.dueDate && task.pd.length && task.programName && task.episode)) {
            taskValidationSpanRef.current.innerText = '모든 필수 정보를 입력해주세요.'
            error = true
        } else taskValidationSpanRef.current.innerText = ''
        if (workers.filter(value => !(value.workType && (/^(sync|transcribe)$/.test(value.workType) ? value.targetLanguage : value.sourceLanguage && value.targetLanguage))).length !== 0) {
            workerValidationSpanRef.current.innerText = '모든 필수 정보를 입력해주세요.'
            error = true
        } else workerValidationSpanRef.current.innerText = ''
        if (error) return
        submitToggleShow()
    }

    const setProjectInfo = useCallback((value) => {
        const reset = () => {
            setTask(prevState => {
                const {projectInfo, ...rest} = prevState
                return {...rest, projectInfo: {projectId: null}}
            })
            projectCodeRef.current.value = ''
        }
        if (!/^\d{8}-\d{2}$/.test(value)) {
            reset()
            return
        }
        axios.get(`v1/project/projects/${value}`).then((response) => {
            setTask(prevState => ({
                ...prevState,
                projectInfo: {
                    projectId: response.data.project_id,
                    projectCode: value,
                    projectName: response.data.project_name,
                    clientName: response.data.client_name,
                }
            }))
        }).catch(reset)
    }, [])

    useEffect(() => {
        if (!show) return
        axios.get(`v1/user/workers`).then((response) => setWorkerListOption(response.data.map(value => ({
            value: value.user_id, label: value.user_name, email: value.user_email
        }))))
        axios.get(`v1/user/pm`).then((response) => setPmListOption(response.data.map(value => ({
            value: value.user_id, label: value.user_name, email: value.user_email
        }))))
    }, [show])

    useEffect(() => {
        if (!show || hashedId || !pmListOption.length) return
        setTask(prevState => ({...prevState, pd: [pmListOption.find(value => value.value === userState.user.userId)]}))
    }, [show, hashedId, pmListOption, userState])

    useEffect(() => {
        if (!show) {
            setInitialized(false)
            setTask({})
            setWorkers([])
            setRemovedWorkers([])
            setUploadedFiles([])
            return
        }
        if (hashedId && pmListOption.length) {
            axios.get(`v1/task/tasks/${hashedId}`).then((response) => {
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
                    fileVersion: response.data.task_file_version,
                })
                if (response.data.task_file_info) setUploadedFiles([{name: response.data.task_file_info.name}])
            })
            axios.get(`v1/task/${hashedId}/works`).then((response) => {
                setWorkers(response.data.map((value) => ({
                    workHashedId: value.work_hashed_id,
                    workType: value.work_type,
                    sourceLanguage: value.work_source_language,
                    targetLanguage: value.work_target_language,
                    workerId: value.worker_id,
                    endedAt: value.work_ended_at,
                    dueDate: value.work_due_date,
                    memo: value.work_memo
                })))
            })
        } else {
            setWorkers([{}])
        }
    }, [show, hashedId, pmListOption])

    useEffect(() => {
        if (Object.keys(task).length) setInitialized(true)
    }, [task])

    useEffect(() => {
        if (initialized) taskValidationSpanRef.current.innerText = workerValidationSpanRef.current.innerText = ''
    }, [initialized])

    return initialized && <MDBModalContent className={'bg-furmo'}>
        <MDBModalHeader className={'border-bottom-0'}>
            <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBRow className={'mb-1 px-0 py-3'} style={{backgroundColor: '#f3f3f3ff', margin: 'inherit'}}>
                <span className={'mb-3 text-start fw-bold'}>
                    태스크 정보<span ref={taskValidationSpanRef} className={'input-error-span'}/></span>
                <MDBRow>
                    <MDBCol size={4}>
                        <MDBRow className={'mb-3'}>
                            <MDBCol style={{minWidth: '155px', maxWidth: '155px'}}>
                                <MDBInput ref={projectCodeRef} style={inputStyle} label={'프로젝트 코드'}
                                          labelStyle={labelStyle} defaultValue={task.projectInfo?.projectCode}
                                          onBlur={(event) => setProjectInfo(event.target.value.trim())}/>
                            </MDBCol>
                            <MDBCol>
                                <MDBInput label={'클라이언트명'} labelStyle={labelStyle} disabled tabIndex={-1}
                                          value={task.projectInfo?.clientName || ''}
                                          style={{textOverflow: 'ellipsis', pointerEvents: 'none'}}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol className={'d-flex'}>
                                <Select styles={multiStyle} options={pmListOption} placeholder={null}
                                        components={{Option: UserOption, Control: PdControl}}
                                        isMulti isClearable={false} defaultValue={task.pd}
                                        onChange={(newValue) => {
                                            setTask(prevState => ({...prevState, pd: newValue}))
                                        }}/>
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
                                <MDBInput style={inputStyle} label={'프로젝트 그룹'}
                                          labelStyle={labelStyle} defaultValue={task.projectGroup}
                                          onBlur={(event) => task.projectGroup = event.target.value.trim()}
                                />
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <MDBInput style={inputStyle} label={'*프로그램명'}
                                          labelStyle={labelStyle} defaultValue={task.programName}
                                          onBlur={(event) => task.programName = event.target.value.trim()}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <MDBInput style={inputStyle} label={'*에피소드'} labelStyle={labelStyle}
                                          defaultValue={task.episode}
                                          onBlur={(event) => task.episode = event.target.value.trim()}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBCol>
                    <MDBCol style={{minWidth: '13.5rem', maxWidth: '13.5rem'}}>
                        <MDBRow className={'mb-3'}>
                            <MDBCol>
                                <DatePicker customInput={<DateInput label={'*납품기한'}/>} showTimeSelect
                                            selected={task.dueDate && new Date(task.dueDate)}
                                            timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'} timeIntervals={60}
                                            onChange={(date) => setTask(prevState => ({
                                                ...prevState, dueDate: date.getTime()
                                            }))}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <Select styles={singleStyle} options={genreSelectOption}
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
                <span className={'mb-3 text-start fw-bold'}>
                    작업자 배정<span ref={workerValidationSpanRef} className={'input-error-span'}/></span>
                {workers.map((value, index) => {
                    return <MDBRow key={index} className={'mb-3 align-items-center m-0 p-0'}>
                        <MDBCol style={{display: 'flex'}}>
                            <Select className={'me-2'} styles={singleStyle} options={workTypeSelectOption}
                                    placeholder={'*유형'}
                                    value={workTypeSelectOption.find(value => value.value === workers[index].workType)}
                                    onChange={(newValue) => {
                                        setWorkers(prevState => {
                                            prevState[index].workType = newValue.value
                                            return [...prevState]
                                        })
                                    }}/>
                            {/^(sync|transcribe)$/.test(workers[index].workType) ? null :
                                <Select className={'me-2'} styles={singleStyle}
                                        options={languageSelectOption} placeholder={'*언어'}
                                        value={languageSelectOption.find(value => value.value === workers[index].sourceLanguage)}
                                        onChange={(newValue) => {
                                            setWorkers(prevState => {
                                                prevState[index].sourceLanguage = newValue.value
                                                return [...prevState]
                                            })
                                        }}/>}
                            <Select className={'me-2'} styles={singleStyle} options={languageSelectOption}
                                    value={languageSelectOption.find(value => value.value === workers[index].targetLanguage)}
                                    placeholder={'*언어'} onChange={(newValue) => {
                                setWorkers(prevState => {
                                    prevState[index].targetLanguage = newValue.value
                                    return [...prevState]
                                })
                            }}/>
                        </MDBCol>
                        <MDBCol size={2}>
                            <Select styles={singleStyle} options={workerListOption} placeholder={'작업자 이름'}
                                    value={workerListOption.find(value => value.value === workers[index].workerId)}
                                    components={{Option: UserOption}} onChange={(newValue) => {
                                setWorkers(prevState => {
                                    prevState[index].workerId = newValue.value
                                    return [...prevState]
                                })
                            }}/>
                        </MDBCol>
                        <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                            <DatePicker customInput={<DateInput label={'마감일'}/>} showTimeSelect
                                        selected={workers[index].dueDate && new Date(workers[index].dueDate)}
                                        timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'} timeIntervals={60}
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
                                          workers[index].memo = event.target.value.trim()
                                      }}/>
                        </MDBCol>
                        <MDBBtn className='btn-close' color='none' style={{marginRight: 'calc(0.75rem + 1px)'}}
                                onClick={() => setWorkers(prevState => {
                                    const worker = workers[index]
                                    if (worker.workHashedId) setRemovedWorkers(prevState => [...prevState, worker])
                                    prevState.splice(index, 1)
                                    return [...prevState]
                                })}/>
                    </MDBRow>
                })}
                <MDBBtn className={'w-auto mb-3 bg-white'} color={'link'} style={{marginLeft: '0.75rem'}}
                        onClick={() => setWorkers(prevState => [...prevState, {}])}>+ 추가하기</MDBBtn>
                <MDBRow className={'mb-3 m-0 p-0'}>
                    <MDBCol>
                        <TaskDropzone uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                                      multiple={false}/>
                    </MDBCol>
                </MDBRow>
                {!hashedId ? <MDBCol>
                    <MDBBtn color={'dark'} onClick={inputValidation}>확인</MDBBtn>
                    <MDBModal show={submitModal} setShow={setSubmitModal} tabIndex='-1'>
                        <MDBModalDialog centered>
                            <MDBModalContent className={'bg-furmo'}>
                                <MDBModalBody>
                                    <div className={'px-0 py-3 bg-white'} style={{margin: 'inherit'}}>
                                        <MDBRow>
                                            <MDBCol>
                                                <p>[{task.programName}_{task.episode}]</p>
                                                태스크를 생성하고 작업자 배정을 완료하시겠습니까?
                                            </MDBCol>
                                        </MDBRow>
                                        <div className={'d-flex justify-content-between'} style={{margin: '1rem 5rem'}}>
                                            <MDBBtn className={'bg-furmo'} onClick={async () => {
                                                modifySpinnerRef.current.style.display = ''
                                                submitToggleShow()
                                                axios.post('v1/task/tasks', {
                                                    project_id: task.projectInfo?.projectId,
                                                    pm_id: userState.user.userId,
                                                    pd_ids: task.pd.map(value => value.value),
                                                    task_name: task.programName,
                                                    task_episode: task.episode,
                                                    task_genre: task.genre?.value,
                                                    task_due_date: task.dueDate,
                                                    task_group_key: task.projectGroup,
                                                    task_file_info: await getFileInfo(uploadedFiles[0])
                                                }).then((response) => {
                                                    const {
                                                        task_id: taskId, task_file_version: fileVersion
                                                    } = response.data
                                                    workers.length && axios.post(`v1/task/${taskId}/works`, {
                                                        works: workers.map((value) => ({
                                                            worker_id: value.workerId,
                                                            work_type: value.workType,
                                                            work_source_language: value.sourceLanguage,
                                                            work_target_language: value.targetLanguage,
                                                            work_due_date: value.dueDate,
                                                            work_memo: value.memo,
                                                        }))
                                                    }).then()
                                                    if (uploadedFiles.length) {
                                                        s3Upload(taskId, fileVersion, uploadedFiles, setUploadProgress).then(() => {
                                                            axios.post(`v1/task/initialize/${taskId}`, {
                                                                file_version: fileVersion,
                                                                file_format: fileExtension(uploadedFiles[0].name),
                                                                source_language: workers.filter(value => value.workType === 'translate').map(value => value.sourceLanguage).pop() || '',
                                                                target_languages: workers.filter(value => value.workType === 'translate').map(value => value.targetLanguage)
                                                            }).then(() => {
                                                                modifySpinnerRef.current.style.display = 'none'
                                                                toggleShow()
                                                                forceRenderer()
                                                            })
                                                        })
                                                    } else {
                                                        modifySpinnerRef.current.style.display = 'none'
                                                        toggleShow()
                                                        forceRenderer()
                                                    }
                                                })
                                            }}>확인</MDBBtn>
                                            <MDBBtn color='dark' onClick={submitToggleShow}>취소</MDBBtn>
                                        </div>
                                    </div>
                                </MDBModalBody>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                    <div ref={modifySpinnerRef} className={'fullscreen-block'} style={{display: 'none'}}>
                        <MDBSpinner role='status'>
                            <span className='visually-hidden'>Loading...</span>
                        </MDBSpinner>
                        <span>{`${uploadProgress} %`}</span>
                    </div>
                </MDBCol> : <MDBCol>
                    <MDBBtn color={'dark'} onClick={inputValidation}>수정</MDBBtn>
                    <MDBBtn className={'px-2 mx-3'} color={'link'} style={{color: '#808080'}}
                            onClick={deleteToggleShow}>
                        <MDBIcon fas icon="trash"/>삭제
                    </MDBBtn>
                    <MDBModal show={submitModal} setShow={setSubmitModal} tabIndex='-1'>
                        <MDBModalDialog centered>
                            <MDBModalContent className={'bg-furmo'}>
                                <MDBModalBody>
                                    <div className={'px-0 py-3 bg-white'} style={{margin: 'inherit'}}>
                                        <MDBRow>
                                            <MDBCol>
                                                <p>[{task.programName}_{task.episode}]</p>태스크를 수정하시겠습니까?
                                            </MDBCol>
                                        </MDBRow>
                                        <div className={'d-flex justify-content-between'} style={{margin: '1rem 5rem'}}>
                                            <MDBBtn className={'bg-furmo'} onClick={async () => {
                                                modifySpinnerRef.current.style.display = ''
                                                submitToggleShow()
                                                const fileUpdated = uploadedFiles[0] instanceof File
                                                axios.put('v1/task/tasks', {
                                                    task_hashed_id: hashedId,
                                                    project_id: task.projectInfo.projectId,
                                                    pd_ids: task.pd.map(value => value.value),
                                                    task_name: task.programName,
                                                    task_episode: task.episode,
                                                    task_genre: task.genre?.value,
                                                    task_due_date: task.dueDate,
                                                    task_group_key: task.projectGroup,
                                                    ...(fileUpdated ? {
                                                        task_file_version: task.fileVersion + 1,
                                                        task_file_info: await getFileInfo(uploadedFiles[0])
                                                    } : {})
                                                }).then((response) => {
                                                    const taskId = response.data
                                                    const newWorks = []
                                                    const updateWorks = []
                                                    const updateWorkParser = (value, remove) => ({
                                                        work_hashed_id: value.workHashedId,
                                                        work_deactivated: remove,
                                                        worker_id: value.workerId,
                                                        work_type: value.workType,
                                                        work_source_language: value.sourceLanguage,
                                                        work_target_language: value.targetLanguage,
                                                        work_ended_at: value.endDate,
                                                        work_due_date: value.dueDate,
                                                        work_memo: value.memo,
                                                    })
                                                    workers.forEach((value) => {
                                                        if (value.workHashedId) {
                                                            updateWorks.push(updateWorkParser(value, false))
                                                        } else {
                                                            newWorks.push({
                                                                worker_id: value.workerId,
                                                                work_type: value.workType,
                                                                work_source_language: value.sourceLanguage,
                                                                work_target_language: value.targetLanguage,
                                                                work_due_date: value.dueDate,
                                                                work_memo: value.memo,
                                                            })
                                                        }
                                                    })
                                                    removedWorkers.forEach((value) => {
                                                        updateWorks.push(updateWorkParser(value, true))
                                                    })
                                                    newWorks.length && axios.post(`v1/task/${taskId}/works`, {
                                                        works: newWorks
                                                    }).then()
                                                    updateWorks.length && axios.put(`v1/task/works`, {
                                                        works: updateWorks
                                                    }).then()
                                                    if (fileUpdated) {
                                                        s3Upload(taskId, task.fileVersion + 1, uploadedFiles, setUploadProgress).then(() => {
                                                            axios.post(`v1/task/initialize/${taskId}`, {
                                                                file_version: task.fileVersion + 1,
                                                                file_format: fileExtension(uploadedFiles[0].name),
                                                                source_language: workers.filter(value => value.workType === 'translate').map(value => value.sourceLanguage).pop(),
                                                                target_languages: workers.filter(value => value.workType === 'translate').map(value => value.targetLanguage)
                                                            }).then(() => {
                                                                modifySpinnerRef.current.style.display = 'none'
                                                                toggleShow()
                                                                forceRenderer()
                                                            })
                                                        })
                                                    } else {
                                                        modifySpinnerRef.current.style.display = 'none'
                                                        toggleShow()
                                                        forceRenderer()
                                                    }
                                                })
                                            }}>확인</MDBBtn>
                                            <MDBBtn color={'dark'} onClick={submitToggleShow}>취소</MDBBtn>
                                        </div>
                                    </div>
                                </MDBModalBody>
                            </MDBModalContent>
                        </MDBModalDialog>
                    </MDBModal>
                    <div ref={modifySpinnerRef} className={'fullscreen-block'} style={{display: 'none'}}>
                        <MDBSpinner role='status'>
                            <span className='visually-hidden'>Loading...</span>
                        </MDBSpinner>
                        <span>{`${uploadProgress} %`}</span>
                    </div>
                    <MDBModal show={deleteModal} setShow={setDeleteModal} tabIndex='-1'>
                        <MDBModalDialog centered>
                            <MDBModalContent className={'bg-furmo'}>
                                <MDBModalBody>
                                    <div className={'bg-white'} style={{margin: 'inherit', padding: '1rem 0'}}>
                                        <MDBRow>
                                            <MDBCol>
                                                <p>[{task.programName}_{task.episode}]</p>
                                                태스크를 삭제하시겠습니까?
                                            </MDBCol>
                                        </MDBRow>
                                        <div className={'d-flex justify-content-between'} style={{margin: '1rem 5rem'}}>
                                            <MDBBtn className={'bg-furmo'} onClick={() => {
                                                axios.put('v1/task/tasks', {
                                                    task_hashed_id: hashedId,
                                                    task_deactivated: true
                                                }).then(() => {
                                                    deleteToggleShow()
                                                    toggleShow()
                                                    forceRenderer()
                                                })
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
