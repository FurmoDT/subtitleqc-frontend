import {useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../utils/authContext";
import {
    MDBBadge,
    MDBBtn,
    MDBCard,
    MDBCardBody,
    MDBCardText,
    MDBCardTitle,
    MDBCol,
    MDBInput,
    MDBListGroup,
    MDBListGroupItem,
    MDBRow,
    MDBTabs,
    MDBTabsContent,
    MDBTabsPane
} from "mdb-react-ui-kit";
import axios from "../utils/axios";
import {useNavigate} from "react-router-dom";
import {birthdayValidator} from "../utils/functions";

const ProfilePage = () => {
    const pathname = window.location.pathname;
    const navigate = useNavigate()
    const {userState} = useContext(AuthContext)
    const [userInfo, setUserInfo] = useState({})
    useEffect(() => {
        if (userState.isAuthenticated) {
            axios.get(`/v1/user/me`).then((response) => {
                setUserInfo(response.data)
            })
        } else navigate('/login')
    }, [userState, navigate])
    const LeftPanel = () => {
        const [basicActive, setBasicActive] = useState(pathname)
        const handleBasicClick = (value) => {
            if (value === basicActive) return;
            setBasicActive(value);
            navigate(value)
        }
        return <MDBCard>
            <MDBListGroup>
                <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/profile')} action
                                  active={basicActive === '/profile'}>내 정보</MDBListGroupItem>
                <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/profile/1')} action
                                  active={basicActive === '/profile/1'}>Tab-Sample</MDBListGroupItem>
                <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/profile/2')} action
                                  active={basicActive === '/profile/2'}>Tab-Sample</MDBListGroupItem>
            </MDBListGroup>
        </MDBCard>
    }

    const RightPanel = () => {
        const ProfilePanel = () => {
            const [basicActive, setBasicActive] = useState('tab1')
            const nameInputRef = useRef(null)
            const birthInputRef = useRef(null)
            const phoneInputRef = useRef(null)
            const accountInputRef = useRef(null)
            const handleBasicClick = (value, update) => {
                if (value === basicActive) return;
                if (update) {
                    if (!nameInputRef.current.value) return
                    if (!(birthInputRef.current.value?.match(/^\d{4}-\d{2}-\d{2}$/) && new Date(birthInputRef.current.value).valueOf())) return
                    axios.post(`/v1/user/me`, {
                        user: {
                            user_name: nameInputRef.current.value,
                            user_birthday: birthInputRef.current.value,
                            user_phone: phoneInputRef.current.value,
                            user_account: accountInputRef.current.value,
                        }
                    }).then((response) => {
                        setUserInfo(response.data)
                    })
                }
                setBasicActive(value);
            };
            useEffect(() => {
                nameInputRef.current.value = userInfo.user_name || null
                birthInputRef.current.value = userInfo.user_birthday || null
                phoneInputRef.current.value = userInfo.user_phone || null
                accountInputRef.current.value = userInfo.user_account || null
            }, [basicActive])
            return <MDBCard className={'text-center'}>
                <MDBCardBody>
                    <MDBCardTitle className={'mb-5'} style={{display: 'flex', justifyContent: 'space-between'}}>
                        <MDBBadge light>기본정보</MDBBadge>
                        <MDBBadge color={"secondary"}
                                  light>{userInfo.user_role === 'admin' ? '관리자' : userInfo.user_role === 'pm' ? 'PM' : userInfo.user_role === 'worker' ? '작업자' : undefined}</MDBBadge>
                    </MDBCardTitle>
                    <MDBTabs>
                        <MDBTabsContent style={{width: '100%'}}>
                            <MDBTabsPane show={basicActive === 'tab1'}>
                                <MDBCardText style={{lineHeight: '1rem'}}>
                                    <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                        이메일</MDBBadge><br/>{userInfo.user_email}</MDBCardText>
                                <MDBCardText style={{lineHeight: '1rem'}}>
                                    <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                        이름</MDBBadge><br/>{userInfo.user_name}</MDBCardText>
                                <MDBCardText style={{lineHeight: '1rem'}}>
                                    <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                        생년월일</MDBBadge><br/>{userInfo.user_birthday}</MDBCardText>
                                <MDBCardText style={{lineHeight: '1rem'}}>
                                    <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                        휴대폰 번호</MDBBadge><br/>{userInfo.user_phone}</MDBCardText>
                                <MDBCardText style={{lineHeight: '1rem'}}>
                                    <MDBBadge style={{position: 'absolute', left: '25%'}} color={"light"} light>
                                        계좌 번호</MDBBadge><br/>{userInfo.user_account}</MDBCardText>
                                <MDBBtn className={'float-end'} onClick={() => handleBasicClick('tab2')}>수정</MDBBtn>
                            </MDBTabsPane>
                            <MDBTabsPane show={basicActive === 'tab2'}>
                                <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                                    <div style={{width: '50%'}}>
                                        <h4 className={'mb-4'}>
                                            <MDBBadge color={'light'} light>{userInfo.user_email}</MDBBadge>
                                        </h4>
                                        <MDBInput ref={nameInputRef} wrapperClass={'mb-4'} label={'이름'}/>
                                        <MDBInput ref={birthInputRef} wrapperClass={'mb-4'} label={'생년월일'}
                                                  onChange={(event) => {
                                                      event.target.value = birthdayValidator(event.target.value)
                                                  }}/>
                                        <MDBInput ref={phoneInputRef} wrapperClass={'mb-4'} label={'휴대폰 번호'}/>
                                        <MDBInput ref={accountInputRef} wrapperClass={'mb-4'} label={'계좌 번호'}/>
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
        if (pathname === '/profile') return <ProfilePanel/>
        else if (pathname === '/profile/1') return <div>sample1</div>
        else if (pathname === '/profile/2') return <div>sample2</div>
    }
    return <div style={{width: '100%', height: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center'}}>
        <MDBRow style={{width: '100%', maxWidth: '75rem', marginTop: '30px'}}>
            <MDBCol md={'3'}>
                <LeftPanel/>
            </MDBCol>
            <MDBCol md={'9'}>
                <RightPanel/>
            </MDBCol>
        </MDBRow>
    </div>
};

export default ProfilePage
