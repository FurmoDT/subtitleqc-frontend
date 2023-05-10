import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import {useRef} from "react";

const SignupPage = () => {
    const nameInputRef = useRef(null)
    const emailInputRef = useRef(null)
    const passwordInputRef = useRef(null)
    const errorLabelRef = useRef(null)
    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className={'auth-container'}>
            <div className={'auth-title'}>회원가입</div>
            <MDBInput ref={nameInputRef} wrapperClass={'auth-input'} label='name' type={'text'}/>
            <MDBInput ref={emailInputRef} wrapperClass={'auth-input'} label='Email' type={'email'}/>
            <MDBInput ref={passwordInputRef} wrapperClass={'auth-input'} label='Password'
                      type={'password'}/>
            <MDBInput wrapperClass={'auth-input'} label='Confirm Password' type={'password'}/>
            <MDBBtn style={{marginBottom: 10, width: 300}} color={'success'} onClick={() => {
                errorLabelRef.current.innerText = 'test'
            }}>회원가입</MDBBtn>
            <label ref={errorLabelRef} style={{fontSize: 13, color: 'red'}}/>
        </div>
    </div>
};

export default SignupPage
