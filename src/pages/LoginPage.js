import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google";
import {googleClientId, naverClientId} from "../utils/config";
import {useCallback, useContext, useEffect, useRef} from "react";
import {AuthContext} from "../utils/authContext";

const {naver} = window
const naverLogin = new naver.LoginWithNaverId({
    clientId: naverClientId,
    callbackUrl: `${window.location.origin}/login`,
    isPopup: true,
    callbackHandel: true,
    loginButton: {},
});

const LoginPage = (props) => {
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
                errorLabelRef.current.innerText = 'Invalid Email Format'
            } else if (reason.response.status === HttpStatusCode.NotFound) {
                if (data.auth.auth_type !== 'email') {
                    axios.post(`/v1/auth/register`, {
                        ...data, user: {}
                    }).then((registerResponse) => {
                        setUserState({accessToken: registerResponse.data.access_token})
                        navigate('/')
                    })
                } else {
                    errorLabelRef.current.innerText = 'Not Registered'
                }
            } else if (reason.response.status === HttpStatusCode.Forbidden) {
                errorLabelRef.current.innerText = 'Wrong Password'
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
        <div style={{
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderStyle: 'solid',
            color: 'rgba(0, 0, 0, 0.23)',
            borderRadius: 5,
            paddingTop: 30,
            paddingBottom: 50
        }}>
            <div
                style={{
                    fontSize: '50px',
                    fontWeight: 700,
                    textAlign: 'center',
                    color: 'black',
                    marginBottom: 30,
                    fontFamily: 'Nanum Gothic'
                }}>로그인
            </div>
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
                    fontWeight: '400',
                    backgroundColor: '#03c75a',
                    color: 'white',
                    marginBottom: '20px'
                }} onClick={() => naverLoginRef.current?.children[0]?.click()}>
                    <img style={{height: '24px'}} src={'/naver.png'} alt={'naver'}/>
                    <span style={{flex: 1}}>네이버 아이디로 로그인</span>
                </MDBBtn>
            </div>
            <div style={{
                width: 300,
                borderBottom: 'solid',
                borderWidth: 'thick',
                color: 'rgba(55, 53, 47, 0.16)',
                marginBottom: 25
            }}/>
            <MDBInput ref={emailInputRef} wrapperStyle={{marginBottom: 20, width: 300}} label='Email' type={'email'}/>
            <MDBInput ref={passwordInputRef} wrapperStyle={{marginBottom: 20, width: 300}}
                      label='Password' type={'password'}/>
            <MDBBtn style={{marginBottom: 10, width: 300}} color={'success'} onClick={() => {
                errorLabelRef.current.innerText = ''
                if (!(emailInputRef.current.value && passwordInputRef.current.value)) {
                    errorLabelRef.current.innerText = 'Incorrect Email or Password'
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
