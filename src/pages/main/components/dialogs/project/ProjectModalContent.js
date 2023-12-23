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
import {
    DateInput,
    inputStyle,
    onBlurTrimHandler,
    placeholderDisplayHandler,
    placeholderStyle
} from "../../../../../components/Inputs";
import DatePicker from "react-datepicker";
import {useContext, useEffect, useState} from 'react';
import {removeNonNumeric, thousandSeperator} from "../../../../../utils/functions";
import {estimateXlsxWriter} from "../../../../../utils/xlsxHandler";
import axios from "../../../../../utils/axios";
import Select from "react-select";
import {singleStyle, UserOption} from "../../../../../components/Selects";
import {AuthContext} from "../../../../../contexts/authContext";
import {AiFillPrinter} from "react-icons/ai";

const ProjectModalContent = ({show, toggleShow, projectId}) => {
    const [project, setProject] = useState({})
    const [vatChecked, setVatChecked] = useState(true)
    const [estimateItems, setEstimateItems] = useState([])
    const [clientListOption, setClientListOption] = useState([])
    const [pmListOption, setPmListOption] = useState([])
    const {userState} = useContext(AuthContext)

    useEffect(() => {
        if (!show) return
        axios.get(`v1/projects/clients`).then((response) => {
            setClientListOption(response.data.map(value => ({value: value.client_id, label: value.client_name})))
        })
        axios.get(`v1/users/pm`).then((response) => {
            setPmListOption(response.data.map(value => ({
                value: value.user_id, label: value.user_name, email: value.user_email
            })))
        })
    }, [show])

    useEffect(() => {
        console.log(project)
    }, [project])

    useEffect(() => {
        if (!projectId && pmListOption.length) setProject(prevState => ({
            ...prevState, pm: pmListOption.find(value => value.value === userState.user.userId)
        }))
    }, [pmListOption, projectId, userState])

    useEffect(() => {
        if (!show) {
            setProject({})
            setEstimateItems([])
            return
        }
        if (projectId && clientListOption.length) {
            axios.get(`v1/projects/${projectId}`).then((response) => {
                setProject(prevState => ({
                    ...prevState,
                    projectCode: response.data.project_code,
                    projectName: response.data.project_name,
                    client: clientListOption.find(value => value.value === response.data.client_id)
                }))
                // setEstimateItems
            })
        } else {
            setEstimateItems([{}])
        }
    }, [show, projectId, clientListOption])

    const projectCodeValidator = (code) => {
        if (!/^\d{8}-\d{2}$/.test(code)) setProject(prevState => ({...prevState, projectCode: ''}))
    }

    const EstimateTotalComponent = () => {
        const subtotal = estimateItems.map(value => parseInt(value.price * value.count) || 0).reduce((partialSum, a) => partialSum + a, 0)
        const vat = vatChecked ? Math.round(subtotal * 0.1) : 0

        return <MDBRow className={'text-start py-3 mx-0'} style={{borderBottom: '0.5rem solid #f28720ff'}}>
            <MDBRow className={'mx-0 px-0'}>
                <MDBCol>
                    <label className={'fw-bold mx-1 input-header-label'}>총계</label>
                    <MDBInput style={inputStyle} disabled value={thousandSeperator(subtotal + vat) || ''}/>
                </MDBCol>
                <MDBCol>
                    <label className={'fw-bold mx-1 input-header-label'}>소계</label>
                    <MDBInput style={inputStyle} disabled value={thousandSeperator(subtotal) || ''}/>
                </MDBCol>
                <MDBCol>
                    <label className={'fw-bold mx-1 input-header-label position-relative'}>VAT
                        <input type={'checkbox'} className={'mx-1 position-absolute top-50 translate-middle-y'}
                               checked={vatChecked} onChange={event => setVatChecked(event.target.checked)}/>
                    </label>
                    <MDBInput style={inputStyle} disabled value={thousandSeperator(vat) || ''}/>
                </MDBCol>
            </MDBRow>
        </MDBRow>
    }

    return <MDBModalContent className={'bg-furmo'}>
        <MDBModalHeader className={'border-bottom-0'}>
            <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBRow style={{backgroundColor: '#f3f3f3ff'}} className={'mx-0 py-2'}>
                <MDBCol className={'d-flex flex-column align-items-center px-0'}>
                    <label className={'fw-bold'}>프로젝트 등록</label>
                    <MDBRow className={'text-start py-3 mx-0 flex-fill'}>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol style={{minWidth: '9.5rem', maxWidth: '9.5rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>프로젝트 코드</label>
                                <MDBInput style={inputStyle} value={project.projectCode || ''}
                                          onChange={(event) => setProject(prevState => ({
                                              ...prevState, projectCode: event.target.value
                                          }))}
                                          onBlur={(event) => projectCodeValidator(onBlurTrimHandler(event))}/>
                            </MDBCol>
                            <MDBCol style={{minWidth: '13.5rem', maxWidth: '13.5rem'}}>
                                <label className={'fw-bold mx-1 input-header-label'}>납품기한</label>
                                <DatePicker customInput={<DateInput/>} showTimeSelect timeIntervals={60}
                                            timeFormat={'HH:mm'} dateFormat={'yyyy-MM-dd h:mm aa'}
                                            selected={project.dueDate && new Date(project.dueDate)}
                                            onChange={date => setProject(prevState => ({
                                                ...prevState, dueDate: date.getTime()
                                            }))}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>매출(\)</label>
                                <MDBInput style={inputStyle} value={thousandSeperator(project.sales || '')}
                                          onChange={(event) => setProject(prevState => ({
                                              ...prevState, sales: removeNonNumeric(event.target.value)
                                          }))}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>클라이언트명</label>
                                <Select styles={singleStyle} options={clientListOption} placeholder={null}
                                        isClearable={false} value={project.client || null}
                                        onChange={(newValue) => setProject(prevState => ({
                                            ...prevState, client: newValue
                                        }))}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>프로젝트명</label>
                                <MDBInput style={inputStyle} value={project.projectName || ''}
                                          onChange={(event) => setProject(prevState => ({
                                              ...prevState, projectName: event.target.value
                                          }))} onBlur={onBlurTrimHandler}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>구분</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>PM</label>
                                <Select styles={singleStyle} options={pmListOption} placeholder={null}
                                        components={{Option: UserOption}} isClearable={false} value={project.pm || null}
                                        onChange={(newValue) => setProject(prevState => ({
                                            ...prevState, pm: newValue
                                        }))}/>
                            </MDBCol>
                            <MDBCol>
                                <label className={'fw-bold mx-1 input-header-label'}>편집자</label>
                                <MDBInput style={inputStyle}/>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                거래처 담당자</label></MDBCol></MDBRow>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}
                                          onChange={event => placeholderDisplayHandler(event.target)}>
                                    <label style={placeholderStyle}>이름</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}
                                          onChange={event => placeholderDisplayHandler(event.target)}>
                                    <label style={placeholderStyle}>이메일</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}
                                          onChange={event => placeholderDisplayHandler(event.target)}>
                                    <label style={placeholderStyle}>전화번호</label>
                                </MDBInput>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                거래처 정산 담당자</label></MDBCol></MDBRow>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}
                                          onChange={event => placeholderDisplayHandler(event.target)}>
                                    <label style={placeholderStyle}>이름</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}
                                          onChange={event => placeholderDisplayHandler(event.target)}>
                                    <label style={placeholderStyle}>이메일</label>
                                </MDBInput>
                            </MDBCol>
                            <MDBCol className={'position-relative'}>
                                <MDBInput style={inputStyle}
                                          onChange={event => placeholderDisplayHandler(event.target)}>
                                    <label style={placeholderStyle}>전화번호</label>
                                </MDBInput>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'mx-0 mb-1 px-0'}>
                            <MDBRow><MDBCol><label className={'fw-bold mx-1 input-header-label'}>
                                작업내용</label></MDBCol></MDBRow>
                            <MDBCol>
                                <MDBListGroup className={'rounded bg-white'} style={{
                                    height: 'calc(4.8rem + 4px)', overflowY: 'auto'
                                }}>{[1, 2, 3, 4].map(value => (<MDBListGroupItem className={'px-2 py-0'}
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
                <MDBCol className={'mx-0 my-n2 px-0'} style={{maxWidth: '1px', borderRight: '0.5rem solid #f28720ff'}}/>
                <MDBCol className={'d-flex flex-column align-items-center px-0'}>
                    <label className={'fw-bold'}>견적서 등록</label>
                    <EstimateTotalComponent/>
                    <MDBRow className={'text-start pt-1 pb-3 mx-0 w-100 flex-fill flex-column'}>
                        {estimateItems.map((value, index) => {
                            return <MDBRow key={index} className={'mx-0 px-0 mb-1 align-items-center'}>
                                <MDBCol size={2}>
                                    <label className={'fw-bold mx-1 input-header-label'}>항목</label>
                                    <MDBInput style={inputStyle} value={value.name || ''}
                                              onChange={(event) => setEstimateItems(prevState => {
                                                  prevState[index].name = event.target.value
                                                  return [...prevState]
                                              })} onBlur={onBlurTrimHandler}/>
                                </MDBCol>
                                <MDBCol style={{minWidth: '7rem', maxWidth: '7rem'}}>
                                    <label className={'fw-bold mx-1 input-header-label'}>단가</label>
                                    <MDBInput style={inputStyle} value={thousandSeperator(value.price || '')}
                                              onChange={(event) => setEstimateItems(prevState => {
                                                  prevState[index].price = removeNonNumeric(event.target.value)
                                                  return [...prevState]
                                              })}/>
                                </MDBCol>
                                <MDBCol style={{minWidth: '5rem', maxWidth: '5rem'}}>
                                    <label className={'fw-bold mx-1 input-header-label'}>수량</label>
                                    <MDBInput style={inputStyle} value={thousandSeperator(value.count || '')}
                                              onChange={(event) => setEstimateItems(prevState => {
                                                  prevState[index].count = removeNonNumeric(event.target.value)
                                                  return [...prevState]
                                              })}/>
                                </MDBCol>
                                <MDBCol style={{minWidth: '8.5rem', maxWidth: '8.5rem'}}>
                                    <label className={'fw-bold mx-1 input-header-label'}>금액</label>
                                    <MDBInput style={inputStyle} disabled={true}
                                              value={thousandSeperator(parseInt(value.price) * parseInt(value.count)) || ''}/>
                                </MDBCol>
                                <MDBCol>
                                    <label className={'fw-bold mx-1 input-header-label'}>비고</label>
                                    <MDBInput style={inputStyle} onChange={(event) => setEstimateItems(prevState => {
                                        prevState[index].memo = event.target.value
                                        return [...prevState]
                                    })} onBlur={onBlurTrimHandler}/>
                                </MDBCol>
                                <MDBBtn className='btn-close' color='none'
                                        style={{marginTop: '1.6rem', marginRight: '0.75rem'}}
                                        onClick={() => setEstimateItems(prevState => {
                                            prevState.splice(index, 1)
                                            return [...prevState]
                                        })}/>
                            </MDBRow>
                        })}
                        <MDBRow className={'mx-0 px-0'}>
                            <label className={'fw-bold mx-1 input-header-label pe-none'}>&nbsp;</label>
                            <MDBCol>
                                <MDBBtn className={'mb-1 mx-0 bg-white'} color={'link'}
                                        onClick={() => setEstimateItems(prevState => [...prevState, {}])}>
                                    + 추가하기</MDBBtn>
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className={'d-flex justify-content-end'}>
                            <MDBBtn className={'mt-2'} color={'white'} floating
                                    onClick={async () => await estimateXlsxWriter(project, estimateItems, vatChecked)}>
                                <AiFillPrinter color={'black'} size={25}/></MDBBtn>
                        </MDBRow>
                    </MDBRow>
                </MDBCol>
            </MDBRow>
            <MDBRow className={'d-flex justify-content-center mx-0 mt-2'}>
                <MDBBtn className={'w-auto'} color={'dark'}>등록 완료</MDBBtn>
            </MDBRow>
        </MDBModalBody>
    </MDBModalContent>
}

export default ProjectModalContent
