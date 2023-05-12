import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import {useContext, useRef} from "react";
import axios from "../../utils/axios";
import {AuthContext} from "../../utils/authContext";
import {useNavigate} from "react-router-dom";
import {HttpStatusCode} from "axios";

const SignupPage = () => {
    const navigate = useNavigate()
    const nameInputRef = useRef(null)
    const emailInputRef = useRef(null)
    const passwordInputRef = useRef(null)
    const confirmPasswordInputRef = useRef(null)
    const errorLabelRef = useRef(null)
    const {setUserState} = useContext(AuthContext);
    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className={'auth-container'}>
            <div className={'auth-title'}>회원가입</div>
            <MDBInput ref={nameInputRef} wrapperClass={'auth-input'} label='이름' type={'text'}/>
            <MDBInput ref={emailInputRef} wrapperClass={'auth-input'} label='이메일' type={'email'}/>
            <MDBInput ref={passwordInputRef} wrapperClass={'auth-input'} label='비밀번호' type={'password'} placeholder={'영문+숫자 8자리 이상 입력해주세요.'}/>
            <MDBInput ref={confirmPasswordInputRef} wrapperClass={'auth-input'} label='비밀번호 확인'
                      type={'password'}/>
            <MDBBtn style={{marginBottom: 10, width: 300}} color={'success'} onClick={() => {
                errorLabelRef.current.innerText = ''
                if (!(nameInputRef.current.value && emailInputRef.current.value && passwordInputRef.current.value && confirmPasswordInputRef.current.value)) {
                    errorLabelRef.current.innerText = '모든 필수 정보를 입력해주세요.'
                    return
                }
                if (passwordInputRef.current.value.length < 8) {
                    errorLabelRef.current.innerText = '비밀번호는 영문+숫자 8자리 이상 입력해주세요.'
                    return
                }
                if (passwordInputRef.current.value !== confirmPasswordInputRef.current.value) {
                    errorLabelRef.current.innerText = '비밀번호가 일치하지 않습니다.'
                    return
                }
                axios.post(`/v1/auth/register`, {
                    auth: {
                        auth_type: 'email',
                        user_email: emailInputRef.current.value,
                        user_password: passwordInputRef.current.value
                    }, user: {
                        user_name: nameInputRef.current.value
                    }
                }).then((response) => {
                    if (response.status === HttpStatusCode.Ok) {
                        setUserState({accessToken: response.data.access_token})
                        navigate('/')
                    }
                }).catch((reason) => {
                    if (reason.response.status === HttpStatusCode.UnprocessableEntity) {
                        errorLabelRef.current.innerText = '유효하지 않은 이메일입니다.'
                    } else if (reason.response.status === HttpStatusCode.Conflict) {
                        errorLabelRef.current.innerText = '이미 사용중인 이메일입니다.'
                    }
                })
            }}>회원가입</MDBBtn>
            <label ref={errorLabelRef} style={{fontSize: 13, color: 'red'}}/>
        </div>
    </div>
};

export default SignupPage
