import {forwardRef, useEffect, useState} from 'react';
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
    MDBTextArea,
} from 'mdb-react-ui-kit';
import TaskDropzone from "../TaskDropzone";
import {customMultiStyle, CustomOption, CustomPmControl} from "../../../../utils/customSelect";
import Select from "react-select";
import axios from "../../../../utils/axios";
import DatePicker from "react-datepicker";

const inputStyle = {backgroundColor: 'white'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}

const RequestModal = () => {
    const [show, setShow] = useState(false)
    const [task, setTask] = useState({})
    const [pmListOption, setPmListOption] = useState([])
    const [uploadedFiles, setUploadedFiles] = useState([])
    const toggleShow = () => setShow(!show);

    const CustomInput = forwardRef(({value, onClick, label}, ref) => {
        return <MDBInput style={inputStyle} label={label} labelStyle={labelStyle} onClick={onClick} value={value}/>
    })


    useEffect(() => {
        if (!show) return
        axios.get(`/v1/user/pm`).then((response) => {
            setPmListOption(response.data.map(value => ({
                value: value.user_id,
                label: value.user_name,
                email: value.user_email
            })))
        })
    }, [show])

    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black'}} onClick={toggleShow}>
            새로운 작업 의뢰하기
        </MDBBtn>
        <MDBModal show={show} setShow={setShow} tabIndex='-1' staticBackdrop>
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
                                            setTask(prevState => ({...prevState, pd: newValue}))
                                        }}/>
                            </MDBCol>
                            <MDBCol>
                                <MDBInput style={inputStyle} label={'작업 제목'} labelStyle={labelStyle}/>
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
                                <MDBTextArea label='의뢰사항' rows={4} style={inputStyle} labelStyle={labelStyle}/>
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
                        <MDBBtn color={'dark'} size={'sm'} onClick={() => {
                            // aws(uploadedFiles)
                            toggleShow()
                        }}>의뢰하기</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default RequestModal
