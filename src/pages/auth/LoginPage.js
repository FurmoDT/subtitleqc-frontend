import {MDBBadge, MDBBtn, MDBCollapse, MDBInput} from "mdb-react-ui-kit";
import axios from "../../utils/axios";
import {HttpStatusCode} from "axios";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google";
import {googleClientId, naverClientId} from "../../utils/config";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {AuthContext} from "../../utils/authContext";

const {naver} = window
const naverLogin = new naver.LoginWithNaverId({
    clientId: naverClientId,
    callbackUrl: `${window.location.origin}/login`,
    isPopup: true,
    callbackHandel: true,
    loginButton: {},
});

const LoginPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const naverLoginRef = useRef(null);
    const emailInputRef = useRef(null)
    const passwordInputRef = useRef(null)
    const errorLabelRef = useRef(null)
    const {setUserState} = useContext(AuthContext);
    const [showShow, setShowShow] = useState(false);
    const toggleShow = () => setShowShow(!showShow);

    const authenticate = useCallback((data) => {
        axios.post(`/v1/auth/login`, data).then((response) => {
            if (response.status === HttpStatusCode.Ok) {
                setUserState({accessToken: response.data.access_token})
                navigate('/')
            }
        }).catch((reason) => {
            if (reason.response.status === HttpStatusCode.UnprocessableEntity) {
                errorLabelRef.current.innerText = '유효하지 않은 이메일입니다.'
            } else if (reason.response.status === HttpStatusCode.NotFound) {
                if (data.auth.auth_type !== 'email') {
                    axios.post(`/v1/auth/register`, {
                        ...data, user: {}
                    }).then((registerResponse) => {
                        setUserState({accessToken: registerResponse.data.access_token})
                        navigate('/')
                    })
                } else {
                    errorLabelRef.current.innerText = '등록되지 않은 이메일입니다.'
                }
            } else if (reason.response.status === HttpStatusCode.Forbidden) {
                errorLabelRef.current.innerText = '이메일 또는 비밀번호가 틀렸습니다.'
            }
        })
    }, [navigate, setUserState])

    window.authenticate = authenticate
    const naverLoginCallback = useCallback(() => {
        if (!location.hash) return;
        const token = location.hash.split('=')[1].split('&')[0];
        if (token) {
            window.opener.authenticate({auth: {auth_type: 'naver', access_token: token}})
            window.close()
        }
    }, [location])

    useEffect(() => {
        naverLogin.init();
        naverLoginCallback()
    }, [naverLoginCallback]);

    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className={'auth-container'}>
            <div className={'auth-title'}>로그인</div>
            <div style={{width: '300px', display: 'flex', flexDirection: 'column'}}>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <GoogleLogin size={'large'} width={'300'} text={'continue_with'}
                                 containerProps={{style: {marginBottom: '15px'}}}
                                 onSuccess={credentialResponse => {
                                     authenticate({
                                         auth: {
                                             auth_type: 'google', payload: JSON.stringify(credentialResponse)
                                         }
                                     })
                                 }}
                                 onError={() => {
                                     console.log('Login Failed');
                                 }}/>
                </GoogleOAuthProvider>
                <div ref={naverLoginRef} id="naverIdLogin" style={{display: 'none'}}/>
                <MDBBtn style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.6em 0.8em',
                    fontSize: '0.8rem',
                    backgroundColor: '#03c75a',
                    marginBottom: '15px'
                }} onClick={() => naverLoginRef.current?.children[0]?.click()}>
                    <img style={{height: '24px'}} src={'/naver.png'} alt={'naver'}/>
                    <span style={{flex: 1}}>네이버 아이디로 로그인</span>
                </MDBBtn>
            </div>
            <div style={{
                width: 300, display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20
            }} onClick={toggleShow} onMouseEnter={(event) => {
                event.target.style.cursor = 'pointer'
            }}>
                <div style={{width: '100%'}} className={'horizontal-divider'}/>
                <MDBBadge color={'secondary'} style={{
                    marginLeft: 10, marginRight: 10, fontSize: '0.8rem', fontWeight: 100
                }} light> 이메일로 로그인하기 </MDBBadge>
                <div style={{width: '100%'}} className={'horizontal-divider'}/>
            </div>
            <MDBCollapse show={showShow}>
                <MDBInput ref={emailInputRef} wrapperClass={'auth-input'} label='이메일' type={'email'}/>
                <MDBInput ref={passwordInputRef} wrapperClass={'auth-input'} label='비밀번호' type={'password'}/>
                <MDBBtn style={{marginBottom: 10, width: 300}} color={'success'} onClick={() => {
                    errorLabelRef.current.innerText = ''
                    if (!(emailInputRef.current.value && passwordInputRef.current.value)) {
                        errorLabelRef.current.innerText = '이메일 또는 비밀번호가 틀렸습니다.'
                        return
                    }
                    authenticate({
                        auth: {
                            auth_type: 'email',
                            user_email: emailInputRef.current.value,
                            user_password: passwordInputRef.current.value
                        }
                    })
                }}>로그인</MDBBtn>
                <section style={{display: 'flex', justifyContent: 'center'}}>
                    <label ref={errorLabelRef} style={{fontSize: 13, color: 'red'}}/>
                </section>
                <div style={{display: 'flex', width: 300, justifyContent: 'end', paddingRight: 10}}>
                    <Link to={'/signup'} style={{fontSize: 13, color: 'blue'}}>회원가입</Link>
                </div>
            </MDBCollapse>
        </div>
    </div>
};

export default LoginPage
