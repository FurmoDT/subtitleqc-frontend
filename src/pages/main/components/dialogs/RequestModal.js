import {forwardRef, useEffect, useRef, useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBInput,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBRow,
    MDBSpinner,
    MDBTextArea,
} from 'mdb-react-ui-kit';
import TaskDropzone from "../TaskDropzone";
import {customMultiStyle, CustomOption, CustomPmControl} from "../../../../utils/customSelect";
import Select from "react-select";
import axios from "../../../../utils/axios";
import DatePicker from "react-datepicker";
import {s3Upload} from "../../../../utils/awsS3Upload";
import {fileExtension} from "../../../../utils/functions";

const inputStyle = {backgroundColor: 'white'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}

const RequestModal = () => {
    const [initialized, setInitialized] = useState(false)
    const [show, setShow] = useState(false)
    const [task, setTask] = useState({})
    const [pmListOption, setPmListOption] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const modifySpinnerRef = useRef(null)
    const [submitModal, setSubmitModal] = useState(false);
    const toggleShow = () => setShow(!show);
    const submitToggleShow = () => setSubmitModal(!submitModal);

    const inputValidation = () => {
        let error = false
        if (!(task.pm && task.title && task.dueDate && uploadedFiles.length)) {
            error = true
        }
        if (error) return
        submitToggleShow()
    }


    const CustomInput = forwardRef(({value, onClick, label}, ref) => {
        return <MDBInput style={inputStyle} label={label} labelStyle={labelStyle} onClick={onClick} value={value}/>
    })


    useEffect(() => {
        if (!show) {
            setInitialized(false)
            setTask({})
            setUploadedFiles([])
            return
        }
        axios.get(`/v1/user/pm`).then((response) => {
            setPmListOption(response.data.map(value => ({
                value: value.user_id,
                label: value.user_name,
                email: value.user_email
            })))
        })
        setInitialized(true)
    }, [show])

    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black'}} onClick={toggleShow}>
            새로운 작업 의뢰하기
        </MDBBtn>
        {initialized && <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '900px'}}>
                <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
                    <MDBModalHeader style={{borderBottom: 'none'}}>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <MDBRow className={'mb-3'}>
                            <MDBCol size={3}>
                                <Select styles={customMultiStyle} options={pmListOption} placeholder={null}
                                        components={{Option: CustomOption, Control: CustomPmControl}}
                                        onChange={(newValue) => {
                                            setTask(prevState => ({...prevState, pm: newValue}))
                                        }}/>
                            </MDBCol>
                            <MDBCol>
                                <MDBInput style={inputStyle} label={'*작업 제목'} labelStyle={labelStyle}
                                          onBlur={(event) => task.title = event.target.value.trim()}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                                <DatePicker customInput={<CustomInput label={'*납품기한'}/>}
                                            selected={task.dueDate} showTimeSelect
                                            timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                            onChange={(date) => setTask(prevState => ({
                                                ...prevState, dueDate: date.getTime()
                                            }))}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mb-3'}>
                            <MDBCol>
                                <MDBTextArea label='의뢰사항' rows={4} style={inputStyle} labelStyle={labelStyle}
                                             onBlur={(event) => task.memo = event.target.value.trim()}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol>
                                <TaskDropzone uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles}
                                              multiple={true}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBModalBody>
                    <MDBModalFooter style={{borderTop: 'none', justifyContent: 'center'}}>
                        <MDBBtn color={'dark'} size={'sm'} onClick={inputValidation}>의뢰하기</MDBBtn>
                        <MDBModal show={submitModal} setShow={setSubmitModal} tabIndex='-1'>
                            <MDBModalDialog centered>
                                <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
                                    <MDBModalBody>
                                        <div style={{backgroundColor: 'white', margin: 'inherit', padding: '1rem 0'}}>
                                            <MDBRow>
                                                <MDBCol>
                                                    <p>[{task.title}]</p>
                                                    작업 의뢰를 완료하시겠습니까?
                                                </MDBCol>
                                            </MDBRow>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                margin: '1rem 5rem'
                                            }}>
                                                <MDBBtn style={{backgroundColor: '#f28720ff'}} onClick={() => {
                                                    modifySpinnerRef.current.style.display = ''
                                                    submitToggleShow()
                                                    axios.get('v1/project/empty').then((response) => {
                                                        uploadedFiles.map((file, index) => {
                                                            axios.post('v1/project/task', {
                                                                pm_id: task.pm.value,
                                                                project_id: response.data.project_id,
                                                                task_name: task.title,
                                                                task_due_date: task.dueDate,
                                                                task_file_name: file.name
                                                            }).then((taskResponse) => {
                                                                const [taskId, fileVersion] = taskResponse.data
                                                                s3Upload(taskId, fileVersion, file).then(() => {
                                                                    axios.post('v1/project/task/initialize', null, {
                                                                        params: {
                                                                            task_id: taskId,
                                                                            file_version: fileVersion,
                                                                            file_format: fileExtension(file.name)
                                                                        }
                                                                    }).then(() => {
                                                                        if (index === uploadedFiles.length - 1) {
                                                                            modifySpinnerRef.current.style.display = 'none'
                                                                            toggleShow()
                                                                        }
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                }}>확인</MDBBtn>
                                                <MDBBtn color='dark' onClick={submitToggleShow}>취소</MDBBtn>
                                            </div>
                                        </div>
                                    </MDBModalBody>
                                </MDBModalContent>
                            </MDBModalDialog>
                        </MDBModal>
                    </MDBModalFooter>
                    <div ref={modifySpinnerRef} className={'fullscreen-block'} style={{display: 'none'}}>
                        <MDBSpinner role='status'>
                            <span className='visually-hidden'>Loading...</span>
                        </MDBSpinner>
                    </div>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>}
    </>
}

export default RequestModal
