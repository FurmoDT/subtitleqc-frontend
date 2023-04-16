import {MDBBtn, MDBInput} from "mdb-react-ui-kit";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";
import {useNavigate} from "react-router-dom";

const LoginPage = (props) => {
    const navigate = useNavigate()
    const authenticate = () => {
        axios.post(`/v1/auth/login`, {}).then((response) => {
            if (response.status === HttpStatusCode.Ok) {
                props.userAuth.accessToken = response.data.access_token
                navigate('/')
            }
        })
    }
    return <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{width: '300px', display: 'flex', flexDirection: 'column'}}>
            <div style={{fontSize: '50px', fontWeight: 700, textAlign: 'center', color: 'black'}}>Login</div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <MDBBtn style={{marginBottom: '15px'}} onClick={authenticate}>Google</MDBBtn>
                <MDBBtn style={{marginBottom: '20px'}} onClick={authenticate}>Naver</MDBBtn>
            </div>
            <div style={{width: '100%', borderBottom: 'solid', borderWidth: 'thick', color: 'rgba(55, 53, 47, 0.16)'}}/>
            <label style={{color: 'rgba(55, 53, 47, 0.65)', fontSize: '12px'}}>Email</label>
            <MDBInput/>
            <MDBInput/>
        </div>
    </div>
};

export default LoginPage
