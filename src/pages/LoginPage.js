import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";
import {useLocation, useNavigate} from "react-router-dom";
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
    const {setUserState} = useContext(AuthContext);

    const authenticate = useCallback((data) => {
        axios.post(`/v1/auth/login`, data).then((response) => {
            if (response.status === HttpStatusCode.Ok) {
                setUserState({accessToken: response.data.access_token})
                navigate('/')
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
                style={{fontSize: '50px', fontWeight: 700, textAlign: 'center', color: 'black', marginBottom: 30}}>로그인
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
            <MDBInput wrapperStyle={{marginBottom: 20, width: 300}} label='Email' type={'email'}/>
            <MDBInput wrapperStyle={{marginBottom: 20, width: 300}} label='Password' type='password'/>
            <MDBBtn style={{marginBottom: '5px', width: 300}}>로그인</MDBBtn>
        </div>
    </div>
};

export default LoginPage
