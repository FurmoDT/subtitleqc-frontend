import {forwardRef, useCallback, useContext, useEffect, useRef, useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBInput,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalHeader,
    MDBRow,
} from 'mdb-react-ui-kit';
import Select from "react-select";
import DatePicker from "react-datepicker";
import {ko} from 'date-fns/esm/locale';
import {languageSelectOption, workTypeSelectOption} from "../../../../utils/config";
import axios from "../../../../utils/axios";
import {CustomControl, CustomOption, customStyle} from "../../../../utils/customSelect";
import {AuthContext} from "../../../../utils/authContext";

const inputStyle = {backgroundColor: 'white', color: 'black'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem'}
const baseStyle = {borderStyle: 'none', height: '6rem', overflowY: 'auto', backgroundColor: 'white'};
const dragStyle = {borderStyle: 'dashed', borderColor: '#2196f3'};

let counter = 0

const RegisterModal = () => {
    const [basicModal, setBasicModal] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState(null)
    const [workers, setWorkers] = useState([{}])
    const [dueDate, setDueDate] = useState(null)
    const dropzoneRef = useRef(null)
    const fileInputRef = useRef(null)
    const toggleShow = () => setBasicModal(!basicModal)
    const [workerListOption, setWorkerListOption] = useState([])
    const [pmListOption, setPmListOption] = useState([])
    const {userState} = useContext(AuthContext)
    const CustomInput = forwardRef(({value, onClick, label}, ref) => {
        return <MDBInput style={inputStyle} label={label} labelStyle={labelStyle} onClick={onClick} value={value}/>
    })

    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!counter) {
            counter += 1
            Object.assign(dropzoneRef.current.style, dragStyle);
        }
    }, [])
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, [])
    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation();
        if (e.relatedTarget.tagName === 'DIV') {
            counter--
            Object.assign(dropzoneRef.current.style, baseStyle);
        }
    }, [dropzoneRef])
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        counter--
        Object.assign(dropzoneRef.current.style, baseStyle);
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
            setUploadedFiles(prev => {
                if (prev.map(value => value.name).includes(file.name)) return prev
                else return [...prev, file]
            })
        })
    }, [])
    const handleClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target.className.includes('btn-close')) {
            setUploadedFiles(null)
            return
        }
        Object.assign(dropzoneRef.current.style, dragStyle);
        fileInputRef.current.click()
        setTimeout(() => Object.assign(dropzoneRef.current.style, baseStyle), 100);
    }, [])

    useEffect(() => {
        Object.assign(dropzoneRef.current.style, baseStyle)
        dropzoneRef.current.addEventListener('dragenter', handleDragEnter)
        dropzoneRef.current.addEventListener('dragover', handleDragOver)
        dropzoneRef.current.addEventListener('dragleave', handleDragLeave)
        dropzoneRef.current.addEventListener('drop', handleDrop)
        dropzoneRef.current.addEventListener('click', handleClick)
    }, [handleDragEnter, handleDragOver, handleDragLeave, handleDrop, handleClick])

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


    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black', marginBottom: '0.5rem'}} onClick={toggleShow}>
            신규 태스크 등록
        </MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'xl'} centered style={{minWidth: '900px'}}>
                <MDBModalContent style={{backgroundColor: 'transparent'}}>
                    <MDBModalHeader style={{borderBottom: 'none', backgroundColor: '#f28720ff'}}>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody style={{backgroundColor: '#f28720ff'}}>
                        <MDBRow className={'mb-3'}
                                style={{backgroundColor: '#f3f3f3ff', margin: 'inherit', padding: '1rem 0'}}>
                            <label className={'mb-3'} style={{textAlign: 'left'}}>태스크 정보</label>
                            <MDBRow>
                                <MDBCol size={5}>
                                    <MDBRow className={'mb-3'}>
                                        <MDBCol style={{minWidth: '150px', maxWidth: '150px'}}>
                                            <MDBInput style={inputStyle} label={'프로젝트 코드'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'클라이언트명'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                    </MDBRow>
                                    <MDBRow>
                                        <MDBCol style={{display: 'flex'}}>
                                            {pmListOption.length &&
                                                <Select styles={customStyle} options={pmListOption} placeholder={null}
                                                        components={{Option: CustomOption, Control: CustomControl}}
                                                        isMulti isClearable={false}
                                                        defaultValue={pmListOption.find(value => value.value === userState.user.userId)}/>}
                                        </MDBCol>
                                    </MDBRow>
                                </MDBCol>
                                <MDBCol>
                                    <MDBRow className={'mb-3'}>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'프로젝트명'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                    </MDBRow>
                                    <MDBRow>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'프로그램명'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                    </MDBRow>
                                </MDBCol>
                                <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                                    <MDBRow className={'mb-3'}>
                                        <MDBCol>
                                            <DatePicker customInput={<CustomInput label={'납품기한'}/>} locale={ko}
                                                        selected={dueDate}
                                                        showTimeSelect timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                                        onChange={(date) => setDueDate(date)}/>
                                        </MDBCol>
                                    </MDBRow>
                                    <MDBRow>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'에피소드'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                    </MDBRow>
                                </MDBCol>
                            </MDBRow>
                        </MDBRow>
                        <MDBRow className={'mb-3 m-0 py-3 px-0'} style={{backgroundColor: '#f3f3f3ff'}}>
                            <label className={'mb-3'} style={{textAlign: 'left'}}>작업자 배정</label>
                            {workers.map((value, index) => {
                                return <MDBRow key={index} className={'mb-3 align-items-center m-0 p-0'}>
                                    <MDBCol style={{display: 'flex'}}>
                                        <Select className={'me-2'} styles={customStyle} options={workTypeSelectOption}
                                                placeholder={'유형'}
                                                onChange={(newValue) => {
                                                    setWorkers(prevState => {
                                                        prevState[index].workType = newValue.value
                                                        return [...prevState]
                                                    })
                                                }}/>
                                        {/^(대본|싱크)$/.test(workers[index].workType) ? null :
                                            <Select className={'me-2'} styles={customStyle}
                                                    options={languageSelectOption} placeholder={'언어'}/>}
                                        <Select className={'me-2'} styles={customStyle} options={languageSelectOption}
                                                placeholder={'언어'}/>
                                    </MDBCol>
                                    <MDBCol size={2}>
                                        <Select styles={customStyle} options={workerListOption} placeholder={'작업자 이름'}
                                                components={{Option: CustomOption}}/>
                                    </MDBCol>
                                    <MDBCol style={{minWidth: '220px', maxWidth: '220px'}}>
                                        <DatePicker customInput={<CustomInput label={'마감일'}/>} locale={ko}
                                                    selected={workers[index].dueDate} showTimeSelect
                                                    timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                                    onChange={(date) => {
                                                        setWorkers(prevState => {
                                                            prevState[index].dueDate = date
                                                            return [...prevState]
                                                        })
                                                    }}/>
                                    </MDBCol>
                                    <MDBCol>
                                        <MDBInput style={inputStyle} labelStyle={labelStyle} label={'요청 사항'}/>
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
                                    <MDBListGroup ref={dropzoneRef} style={{textAlign: 'left'}}>
                                        {uploadedFiles ?
                                            <MDBListGroupItem style={{padding: '0 0.75rem'}}>{uploadedFiles.name}
                                                <MDBBtn className='btn-close' color='none'
                                                        style={{position: 'absolute', right: 0}} onClick={handleClick}/>
                                            </MDBListGroupItem> :
                                            <label style={{textAlign: 'left', paddingLeft: '0.75rem', ...labelStyle}}>
                                                파일 업로드 또는 드래그앤드롭</label>
                                        }
                                    </MDBListGroup>
                                    <input ref={fileInputRef} style={{display: 'none'}} type={'file'}
                                           onChange={(e) => {
                                               setUploadedFiles(e.target.files[0])
                                               e.target.value = ''
                                           }}/>
                                </MDBCol>
                            </MDBRow>
                            <MDBCol>
                                <MDBBtn color={'dark'} onClick={() => {
                                    // aws(uploadedFiles)
                                    toggleShow()
                                }}>확인</MDBBtn>
                            </MDBCol>
                        </MDBRow>
                    </MDBModalBody>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RegisterModal
