import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import {GoogleLogin, GoogleOAuthProvider} from "@react-oauth/google";
import {googleClientId, naverClientId} from "../utils/config";
import {useCallback, useEffect, useRef} from "react";

const {naver} = window
const naverLogin = new naver.LoginWithNaverId({
    clientId: naverClientId, callbackUrl: 'http://localhost:3000/login', isPopup: true, callbackHandel: true, loginButton: {},
});

const LoginPage = (props) => {
    const setAccessToken = props.setAccessToken
    const navigate = useNavigate()
    const location = useLocation()
    const naverLoginRef = useRef(null);

    const authenticate = useCallback((data) => {
        axios.post(`/v1/auth/login`, data).then((response) => {
            if (response.status === HttpStatusCode.Ok) {
                setAccessToken(response.data.access_token)
                navigate('/')
            }
        })
    }, [navigate, setAccessToken])

    window.authenticate = authenticate
    const naverLoginCallback = useCallback(() => {
        if (!location.hash) return;
        const token = location.hash.split('=')[1].split('&')[0];
        if (token) {
            window.opener.authenticate({auth_type: 'naver', access_token: token})
            window.close()
        }
    }, [location, authenticate])

    useEffect(() => {
        naverLogin.init();
        naverLoginCallback()
    }, [naverLoginCallback]);

    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: '300px', display: 'flex', flexDirection: 'column'}}>
            <div style={{fontSize: '50px', fontWeight: 700, textAlign: 'center', color: 'black'}}>Login</div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <GoogleLogin size={'large'} width={'300'} text={'continue_with'}
                                 containerProps={{style: {marginBottom: '15px'}}}
                                 onSuccess={credentialResponse => {
                                     authenticate({auth_type: 'google', payload: JSON.stringify(credentialResponse)})
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
                    marginBottom: '15px'
                }} onClick={() => naverLoginRef.current?.children[0]?.click()}>
                    <img style={{height: '24px'}} src={'/naver.png'} alt={'naver'}/>
                    <span style={{flex: 1}}>네이버 아이디로 로그인</span>
                </MDBBtn>
            </div>
            <div style={{width: '100%', borderBottom: 'solid', borderWidth: 'thick', color: 'rgba(55, 53, 47, 0.16)'}}/>
            <label style={{color: 'rgba(55, 53, 47, 0.65)', fontSize: '12px', marginTop: '10px'}}>Email</label>
            <MDBInput wrapperStyle={{marginBottom: '5px'}} label='Email' type={'email'}/>
            <MDBInput wrapperStyle={{marginBottom: '5px'}} label='Password' type='password'/>
            <MDBBtn style={{marginBottom: '5px'}}>로그인</MDBBtn>
        </div>
    </div>
};

export default LoginPage
