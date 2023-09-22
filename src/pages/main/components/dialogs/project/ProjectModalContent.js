import {
    MDBBtn,
    MDBCol,
    MDBInput,
    MDBListGroup,
    MDBListGroupItem,
    MDBModalBody,
    MDBModalContent,
    MDBModalHeader,
    MDBRow,
} from 'mdb-react-ui-kit';
import {DateInput, inputStyle, placeholderStyle} from "../../../../../components/ModalStyle";
import DatePicker from "react-datepicker";
import {useEffect, useState} from 'react';
import {removeNonNumeric, thousandSeperator} from "../../../../../utils/functions";

const ProjectModalContent = ({toggleShow}) => {
    const [project, setProject] = useState({})

    useEffect(() => {
        console.log(project)
    }, [project])

    return <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
        <MDBModalHeader className={'border-bottom-0'}>
            <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBRow style={{backgroundColor: '#f3f3f3ff'}} className={'mx-0 py-2'}>
                <MDBCol className={'d-flex flex-column'}>
                    <label className={'fw-bold mb-1'}>프로젝트 등록</label>
                    <MDBRow className={'text-start py-3 mx-0 flex-fill'}
                            style={{backgroundColor: '#f28720ff', color: 'black'}}>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>클라이언트명</label>
                                <MDBInput style={inputStyle} value={project.clientName}
                                          onChange={(event) => setProject(prevState => ({
                                              ...prevState, clientName: event.target.value
                                          }))}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '13.5rem', maxWidth: '13.5rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>납품기한</label>
                                <DatePicker customInput={<DateInput/>} showTimeSelect timeIntervals={60}
                                            timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                            selected={project.dueDate}
                                            onChange={date => setProject(prevState => ({
                                                ...prevState, dueDate: date.getTime()
                                            }))}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '9rem', maxWidth: '9rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>매출(\)</label>
                                <MDBInput style={inputStyle} value={thousandSeperator(project.sales || '')}
                                          onChange={(event) => setProject(prevState => ({
                                              ...prevState, sales: removeNonNumeric(event.target.value)
                                          }))}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>프로젝트명</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol size={2}>
                                <label className={'fw-bold mx-1 input-header-label'}>구분</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <label className={'fw-bold mx-1 input-header-label'}>PM</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol size={4}>
                                <label className={'fw-bold mx-1 input-header-label'}>PD</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol size={3}>
                                <label className={'fw-bold mx-1 input-header-label'}>편집자</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                거래처 담당자</label></MDBCol></MDBRow>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}>
                                    <label style={placeholderStyle}>이름</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}>
                                    <label style={placeholderStyle}>이메일</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}>
                                    <label style={placeholderStyle}>전화번호</label>
                                </MDBInput>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                거래처 정산 담당자</label></MDBCol></MDBRow>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}>
                                    <label style={placeholderStyle}>이름</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}>
                                    <label style={placeholderStyle}>이메일</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}>
                                    <label style={placeholderStyle}>전화번호</label>
                                </MDBInput>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                작업내용</label></MDBCol></MDBRow>
                            <MDBCol>
                                <MDBListGroup className={'rounded'} style={{
                                    height: 'calc(4.8rem + 4px)',
                                    overflowY: 'auto',
                                    backgroundColor: 'white'
                                }}>
                                    {[1, 2, 3, 4].map(value => (
                                        <MDBListGroupItem className={'px-2 py-0'}
                                                          key={value}>Task {value}</MDBListGroupItem>))}
                                </MDBListGroup>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                프로파일</label></MDBCol></MDBRow>
                            <MDBCol className={'position-relative'} size={4}>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBRow>
                </MDBCol>
                <MDBCol className={'d-flex flex-column'}>
                    <label className={'fw-bold mb-1'}>견적서 등록</label>
                    <MDBRow className={'text-start py-3 mx-0 mb-1'}
                            style={{backgroundColor: '#f28720ff', color: 'black'}}>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>총계</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>소계</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>VAT</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                        </MDBRow>
                    </MDBRow>
                    <MDBRow className={'text-start py-3 mx-0 flex-fill flex-column'}
                            style={{backgroundColor: '#f28720ff', color: 'black'}}>
                        <MDBRow className={'mx-0 px-0 mb-1'}>
                            <MDBCol size={2}>
                                <label className={'fw-bold mx-1 input-header-label'}>항목</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '7rem', maxWidth: '7rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>단가</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '5rem', maxWidth: '5rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>수량</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '8.5rem', maxWidth: '8.5rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>금액</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>비고</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 px-0'}>
                            <label className={'fw-bold mx-1 input-header-label pe-none'}>&nbsp;</label>
                            <MDBCol>
                                <MDBBtn className={'mb-1 mx-0'} color={'link'} style={{backgroundColor: 'white'}}>
                                    + 추가하기</MDBBtn>
                            </MDBCol>
                        </MDBRow>
                    </MDBRow>
                </MDBCol>
            </MDBRow>
        </MDBModalBody>
    </MDBModalContent>
}

export default ProjectModalContent
