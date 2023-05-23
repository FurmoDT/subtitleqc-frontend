import {useContext, useEffect, useState} from "react";
import {AuthContext} from "../../utils/authContext";
import {MDBCard, MDBCol, MDBListGroup, MDBListGroupItem, MDBRow} from "mdb-react-ui-kit";
import axios from "../../utils/axios";
import {useNavigate} from "react-router-dom";
import 'react-phone-number-input/style.css'
import ProfilePanel from './components/ProfilePanel'
import AdminPanel from "./components/AdminPanel";

const ProfilePage = () => {
    const pathname = window.location.pathname;
    const navigate = useNavigate()
    const {userState} = useContext(AuthContext)
    const [userInfo, setUserInfo] = useState({})
    const [isInitialized, setIsInitialized] = useState(false)
    useEffect(() => {
        if (!userState.isAuthenticated) navigate('/login')
    }, [userState, navigate])
    useEffect(() => {
        if (userState.isAuthenticated) {
            axios.get(`/v1/user/me`).then((response) => {
                setUserInfo(response.data)
            })
        }
    }, [userState])
    useEffect(() => {
        if (Object.keys(userInfo).length) setIsInitialized(true)
    }, [userInfo])
    const LeftPanel = () => {
        const [basicActive, setBasicActive] = useState(pathname)
        const handleBasicClick = (value) => {
            if (value === basicActive) return;
            setBasicActive(value);
            navigate(value)
        }
        return <MDBCard>
            <MDBListGroup>
                <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/user')} action
                                  active={basicActive === '/user'}>내 정보</MDBListGroupItem>
                <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/user/project')} action
                                  active={basicActive === '/user/project'}>프로젝트 정보</MDBListGroupItem>
                {/^(admin|PM)$/.test(userInfo.user_role) &&
                    <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/user/admin')} action
                                      active={basicActive === '/user/admin'}>관리자 화면</MDBListGroupItem>}
            </MDBListGroup>
        </MDBCard>
    }

    const RightPanel = () => {

        if (pathname === '/user') {
            return <ProfilePanel isInitialized={isInitialized} userInfo={userInfo} setUserInfo={setUserInfo}/>
        } else if (pathname === '/user/project') {
            return <div>프로젝트 정보</div>
        } else if (pathname === '/user/admin') {
            return <AdminPanel/>
        }
    }
    return <div style={{width: '100%', height: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center'}}>
        <MDBRow style={{width: '100%', maxWidth: '75rem', marginTop: '30px'}}>
            <MDBCol md={'3'}>
                <LeftPanel/>
            </MDBCol>
            <MDBCol md={'9'}>
                <RightPanel/>
            </MDBCol>
        </MDBRow>
    </div>
};

export default ProfilePage
