import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import {useContext, useRef} from "react";
import axios from "../../utils/axios";
import {AuthContext} from "../../contexts/authContext";
import {useNavigate} from "react-router-dom";
import {HttpStatusCode} from "axios";
import {birthdayValidator} from "../../utils/functions";

const SignupPage = () => {
    const navigate = useNavigate()
    const nameInputRef = useRef(null)
    const birthInputRef = useRef(null)
    const emailInputRef = useRef(null)
    const passwordInputRef = useRef(null)
    const confirmPasswordInputRef = useRef(null)
    const errorSpanRef = useRef(null)
    const {updateAccessToken} = useContext(AuthContext);
    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className={'auth-container'}>
            <div className={'auth-title'}>회원가입</div>
            <MDBInput ref={nameInputRef} wrapperClass={'auth-input'} label='이름' type={'text'}/>
            <MDBInput ref={emailInputRef} wrapperClass={'auth-input'} label='이메일' type={'email'}/>
            <MDBInput ref={birthInputRef} wrapperClass={'auth-input'} label='생년월일' type={'text'}
                      placeholder={'YYYY-MM-DD'} onChange={(event) => {
                event.target.value = birthdayValidator(event.target.value)
            }}/>
            <MDBInput ref={passwordInputRef} wrapperClass={'auth-input'} label='비밀번호' type={'password'}
                      placeholder={'영문+숫자 8자리 이상 입력해주세요.'}/>
            <MDBInput ref={confirmPasswordInputRef} wrapperClass={'auth-input'} label='비밀번호 확인'
                      type={'password'}/>
            <MDBBtn style={{marginBottom: 10, width: 300}} color={'success'} onClick={() => {
                errorSpanRef.current.innerText = ''
                if (!(nameInputRef.current.value && emailInputRef.current.value && passwordInputRef.current.value && confirmPasswordInputRef.current.value)) {
                    errorSpanRef.current.innerText = '모든 필수 정보를 입력해주세요.'
                    return
                }
                if (!(birthInputRef.current.value?.match(/^\d{4}-\d{2}-\d{2}$/) && new Date(birthInputRef.current.value).valueOf())) {
                    errorSpanRef.current.innerText = '올바른 생년월일을 입력해주세요.'
                    return
                }
                if (passwordInputRef.current.value.length < 8) {
                    errorSpanRef.current.innerText = '비밀번호는 영문+숫자 8자리 이상 입력해주세요.'
                    return
                }
                if (passwordInputRef.current.value !== confirmPasswordInputRef.current.value) {
                    errorSpanRef.current.innerText = '비밀번호가 일치하지 않습니다.'
                    return
                }
                axios.post(`v1/auth/register`, {
                    auth: {
                        auth_type: 'email',
                        user_email: emailInputRef.current.value,
                        user_password: passwordInputRef.current.value
                    }, user: {
                        user_name: nameInputRef.current.value, user_birthday: birthInputRef.current.value
                    }
                }, {withCredentials: true}).then((response) => {
                    if (response.status === HttpStatusCode.Ok) {
                        updateAccessToken(response.data.access_token)
                        navigate('/')
                    }
                }).catch((reason) => {
                    if (reason.response.status === HttpStatusCode.UnprocessableEntity) {
                        errorSpanRef.current.innerText = '유효하지 않은 이메일입니다.'
                    } else if (reason.response.status === HttpStatusCode.Conflict) {
                        errorSpanRef.current.innerText = '이미 사용중인 이메일입니다.'
                    }
                })
            }}>회원가입</MDBBtn>
            <span ref={errorSpanRef} className={'input-error-span'}/>
        </div>
    </div>
};

export default SignupPage
