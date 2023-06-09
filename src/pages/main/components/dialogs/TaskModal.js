import {useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBIcon,
    MDBInput,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBRadio,
    MDBRow,
    MDBTextArea,
} from 'mdb-react-ui-kit';
import Select from "react-select";

const inputStyle = {backgroundColor: 'white'}
const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem', color: 'black'}
const TaskModal = () => {
    const [basicModal, setBasicModal] = useState(false);
    const [workers, setWorkers] = useState([{}])
    const toggleShow = () => setBasicModal(!basicModal);
    return <>
        <MDBBtn style={{backgroundColor: '#f28720ff', color: 'black', marginBottom: '0.5rem'}} onClick={toggleShow}>
            신규 의뢰 확인</MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1' staticBackdrop>
            <MDBModalDialog size={'fullscreen'} style={{height: 'auto', marginTop: '1rem'}}>
                <MDBRow style={{margin: 'inherit', justifyContent: 'center'}}>
                    <MDBCol lg={4}>
                        <MDBModalContent style={{backgroundColor: '#b7b7b7ff', height: 'auto'}}>
                            <MDBModalHeader style={{borderBottom: 'none', justifyContent: 'center', color: 'black'}}>
                                작업 의뢰 카드</MDBModalHeader>
                            <MDBModalBody>
                                <MDBRow className={'mb-3'}>
                                    <MDBCol size={7}>
                                        <MDBInput style={inputStyle} label={'클라이언트 이메일'} labelStyle={labelStyle}/>
                                    </MDBCol>
                                    <MDBCol size={5}>
                                        <MDBInput style={inputStyle} label={'납품기한'} labelStyle={labelStyle}/>
                                    </MDBCol>
                                </MDBRow>
                                <MDBRow className={'mb-3'}>
                                    <MDBCol size={5}>
                                        <MDBInput style={inputStyle} label={'PM 이름'} labelStyle={labelStyle}/>
                                    </MDBCol>
                                    <MDBCol size={7} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <MDBInput style={inputStyle} label={'PD 이름'} labelStyle={labelStyle}/>
                                            <MDBBtn size={'sm'} color={'dark'}
                                                    style={{whiteSpace: 'pre', width: '3.5rem'}}>변경</MDBBtn>
                                        </div>
                                    </MDBCol>
                                </MDBRow>
                                <MDBRow className={'mb-3'}>
                                    <MDBCol>
                                        <MDBTextArea label='의뢰사항' rows={4} style={inputStyle} labelStyle={labelStyle}/>
                                    </MDBCol>
                                </MDBRow>
                                <MDBRow className={'mb-3'}>
                                    <MDBCol>
                                        <MDBListGroup numbered style={{
                                            textAlign: 'left',
                                            borderRadius: '0.25rem',
                                            height: '6rem',
                                            backgroundColor: 'white'
                                        }}>
                                            <MDBListGroupItem style={{padding: '0 0.75rem'}}>파일</MDBListGroupItem>
                                        </MDBListGroup>
                                    </MDBCol>
                                </MDBRow>
                            </MDBModalBody>
                        </MDBModalContent>
                    </MDBCol>
                    <MDBCol lg={8}>
                        <MDBModalContent style={{backgroundColor: 'transparent'}}>
                            <MDBModalHeader style={{borderBottom: 'none', backgroundColor: '#f28720ff'}}>
                                <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                            </MDBModalHeader>
                            <MDBModalBody style={{backgroundColor: '#f28720ff'}}>
                                <MDBRow className={'mb-3'}
                                        style={{backgroundColor: '#f3f3f3ff', margin: 'inherit', padding: '1rem 0'}}>
                                    <label className={'mb-3'} style={{textAlign: 'left'}}>태스크 정보</label>
                                    <MDBRow className={'mb-3'}>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'프로젝트 코드'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'클라이언트명'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'프로젝트명'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'납품기한'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                    </MDBRow>
                                    <MDBRow>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'프로그램명'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'에피소드'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                        <MDBCol>
                                            <MDBInput style={inputStyle} label={'언어쌍'} labelStyle={labelStyle}/>
                                        </MDBCol>
                                    </MDBRow>
                                </MDBRow>
                                <MDBRow className={'mb-3 m-0 py-3 px-0'} style={{backgroundColor: '#f3f3f3ff'}}>
                                    <label style={{textAlign: 'left'}}>작업자 배정</label>
                                    <MDBBtn color={'link'} style={{
                                        backgroundColor: 'white',
                                        width: 'auto',
                                        margin: '1rem 0.75rem',
                                        whiteSpace: 'nowrap'
                                    }} onClick={() => setWorkers(prevState => [...prevState, {}])}>+ 추가하기</MDBBtn>
                                    {workers.map((value, index) => {
                                        return <MDBRow key={index}
                                                       className={'mb-3 align-items-center m-0 p-0 flex-nowrap'}>
                                            <MDBCol style={{display: 'flex', flexDirection: 'row'}}>
                                                <Select styles={{
                                                    container: base => ({...base, width: '5rem'}),
                                                    dropdownIndicator: base => ({...base, padding: 0})
                                                }} options={[
                                                    {value: '대본', label: '대본'},
                                                    {value: '싱크', label: '싱크'},
                                                    {value: '번역', label: '번역'},
                                                    {value: '감수', label: '감수'},
                                                    {value: 'QC', label: 'QC'}]} placeholder={'선택'}/>
                                                <MDBBtn color={'link'} size={'sm'} style={{whiteSpace: 'pre'}}>
                                                    언어선택</MDBBtn>
                                                <MDBBtn color={'link'} size={'sm'} style={{whiteSpace: 'pre'}}>
                                                    언어선택</MDBBtn>
                                                <MDBCol size={2} style={{maxWidth: '10rem'}}><MDBInput
                                                    style={inputStyle} labelStyle={labelStyle}
                                                    label={'작업자 이름'}/></MDBCol>
                                                <MDBCol size={2} style={{maxWidth: '10rem'}}><MDBInput
                                                    style={inputStyle} labelStyle={labelStyle} label={'마감일'}/></MDBCol>
                                                <MDBCol><MDBInput style={inputStyle} labelStyle={labelStyle}
                                                                  label={'요청 사항'}/></MDBCol>
                                            </MDBCol>
                                            <MDBBtn className='btn-close me-1' color='none'
                                                    onClick={() => setWorkers(prevState => {
                                                        console.log(index)
                                                        prevState.splice(index, 1)
                                                        return [...prevState]
                                                    })}/>
                                        </MDBRow>
                                    })}
                                    <MDBRow className={'mb-3 align-items-center m-0 p-0'}>
                                        <MDBCol size={10}>
                                            <MDBListGroup numbered style={{
                                                borderRadius: '0.25rem',
                                                backgroundColor: 'white',
                                                height: '3rem',
                                            }}><label
                                                style={{textAlign: 'left', paddingLeft: '0.75rem', fontSize: '0.8rem'}}>파일
                                                선택</label></MDBListGroup></MDBCol>
                                        <MDBCol size={2}>
                                            <div>
                                                <MDBRadio name='flexRadioDefault' id='flexRadioVideo' label='Video'
                                                          defaultChecked/>
                                                <MDBRadio name='flexRadioDefault' id='flexRadioText' label='Text'/>
                                            </div>
                                        </MDBCol>
                                    </MDBRow>
                                    <MDBCol>
                                        <MDBBtn color={'dark'}>확인</MDBBtn>
                                    </MDBCol>
                                </MDBRow>
                            </MDBModalBody>
                            <MDBModalFooter style={{
                                backgroundColor: 'transparent',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                <MDBIcon fas icon="circle" color={'light'} style={{margin: '0.5rem 0.25rem'}}/>
                                <MDBIcon fas icon="circle" color={'dark'} style={{margin: '0.5rem 0.25rem'}}/>
                                <MDBIcon fas icon="circle" color={'dark'} style={{margin: '0.5rem 0.25rem'}}/>
                                <MDBBtn color={'dark'} style={{margin: '0.5rem 0.25rem'}} size={'sm'}>태스크 추가하기</MDBBtn>
                            </MDBModalFooter>
                        </MDBModalContent>
                    </MDBCol>
                </MDBRow>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default TaskModal
