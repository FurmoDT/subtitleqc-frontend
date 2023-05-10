import {MDBBtn, MDBInput} from "mdb-react-ui-kit";

const SignupPage = () => {
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
                }}>회원가입
            </div>
            <MDBInput wrapperStyle={{marginBottom: 20, width: 300}} label='name' type={'text'}/>
            <MDBInput wrapperStyle={{marginBottom: 20, width: 300}} label='Email' type={'email'}/>
            <MDBInput wrapperStyle={{marginBottom: 20, width: 300}} label='Password' type={'password'}/>
            <MDBInput wrapperStyle={{marginBottom: 20, width: 300}} label='Confirm Password' type={'password'}/>

            <MDBBtn style={{marginBottom: 10, width: 300}} color={'success'} onClick={() => {
            }}>회원가입</MDBBtn>
        </div>
    </div>
};

export default SignupPage
