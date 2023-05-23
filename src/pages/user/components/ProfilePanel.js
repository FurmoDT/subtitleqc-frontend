import {useEffect, useRef, useState} from "react";
import {
    MDBBadge,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
    MDBInput,
    MDBTabs,
    MDBTabsContent,
    MDBTabsPane
} from "mdb-react-ui-kit";
import axios from "../../../utils/axios";
import {birthdayValidator} from "../../../utils/functions";
import 'react-phone-number-input/style.css'
import PhoneInput, {formatPhoneNumber} from 'react-phone-number-input'

const ProfilePanel = (props) => {
    const [basicActive, setBasicActive] = useState('tab1')
    const birthInputRef = useRef(null)
    const [phoneInputValue, setPhoneInputValue] = useState('')
    const handleBasicClick = (value, update) => {
        if (value === basicActive) return;
        if (update) {
            if (!(birthInputRef.current.value?.match(/^\d{4}-\d{2}-\d{2}$/) && new Date(birthInputRef.current.value).valueOf())) return
            axios.post(`/v1/user/me`, {
                user: {
                    user_birthday: birthInputRef.current.value, user_phone: phoneInputValue,
                }
            }).then((response) => {
                props.setUserInfo(response.data)
            })
        }
        setBasicActive(value);
    };
    useEffect(() => {
        birthInputRef.current.value = props.userInfo.user_birthday || null
        setPhoneInputValue(props.userInfo.user_phone || null)
    }, [basicActive, props.userInfo])
    return <MDBCard className={'text-center'} style={{display: props.isInitialized ? '' : 'none'}}>
        <MDBCardBody>
            <MDBCardTitle className={'mb-5'} style={{display: 'flex', justifyContent: 'space-between'}}>
                <MDBBadge light>기본정보</MDBBadge>
                <MDBBadge color={"secondary"} light>
                    {props.userInfo.user_role === 'admin' ? '관리자' : props.userInfo.user_role === 'pm' ? 'PM' : props.userInfo.user_role === 'worker' ? '작업자' : undefined}
                </MDBBadge>
            </MDBCardTitle>
            <MDBTabs>
                <MDBTabsContent style={{width: '100%'}}>
                    <MDBTabsPane show={basicActive === 'tab1'}>
                        <MDBCardText style={{lineHeight: '1rem'}}>
                            <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                이메일</MDBBadge><br/>{props.userInfo.user_email}</MDBCardText>
                        <MDBCardText style={{lineHeight: '1rem'}}>
                            <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                생년월일</MDBBadge><br/>{props.userInfo.user_birthday}</MDBCardText>
                        <MDBCardText style={{lineHeight: '1rem'}}>
                            <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                휴대폰 번호</MDBBadge><br/>{formatPhoneNumber(props.userInfo.user_phone)}</MDBCardText>
                        <MDBBtn className={'float-end'} onClick={() => handleBasicClick('tab2')}>수정</MDBBtn>
                    </MDBTabsPane>
                    <MDBTabsPane show={basicActive === 'tab2'}>
                        <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                            <div style={{width: '50%'}}>
                                <h4 className={'mb-4'}>
                                    <MDBBadge color={'light'} light>{props.userInfo.user_email}</MDBBadge>
                                </h4>
                                <MDBInput ref={birthInputRef} wrapperClass={'mb-4'} label={'생년월일'}
                                          onChange={(event) => {
                                              event.target.value = birthdayValidator(event.target.value)
                                          }}/>
                                <PhoneInput className={'mb-4'} placeholder="휴대폰 번호" defaultCountry={'KR'}
                                            value={phoneInputValue} onChange={setPhoneInputValue}
                                            international={false}/>
                            </div>
                        </div>
                        <MDBBtn className={'float-end'} onClick={() => handleBasicClick('tab1', true)}
                                style={{marginLeft: '0.5rem'}}>확인</MDBBtn>
                        <MDBBtn className={'float-end'} onClick={() => handleBasicClick('tab1')}
                                color={'secondary'} outline>취소</MDBBtn>
                    </MDBTabsPane>
                </MDBTabsContent>
            </MDBTabs>
        </MDBCardBody>
    </MDBCard>
}

export default ProfilePanel
