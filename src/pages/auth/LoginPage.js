import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import axios from "../../utils/axios";
import {HttpStatusCode} from "axios";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google";
import {googleClientId, naverClientId} from "../../utils/config";
import {useCallback, useContext, useEffect, useRef} from "react";
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
                    marginBottom: '20px'
                }} onClick={() => naverLoginRef.current?.children[0]?.click()}>
                    <img style={{height: '24px'}} src={'/naver.png'} alt={'naver'}/>
                    <span style={{flex: 1}}>네이버 아이디로 로그인</span>
                </MDBBtn>
            </div>
            <div className={'horizontal-divider'} style={{width: 300}}/>
            <MDBInput ref={emailInputRef} wrapperClass={'auth-input'} label='Email' type={'email'}/>
            <MDBInput ref={passwordInputRef} wrapperClass={'auth-input'} label='Password' type={'password'}/>
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
            <label ref={errorLabelRef} style={{fontSize: 13, color: 'red'}}/>
            <div style={{display: 'flex', width: 300, justifyContent: 'end', paddingRight: 10}}>
                <Link to={'/signup'} style={{fontSize: 14, color: 'blue'}}>회원가입</Link>
            </div>
        </div>
    </div>
};

export default LoginPage