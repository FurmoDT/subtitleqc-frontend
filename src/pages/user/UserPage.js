import {useContext, useEffect, useRef, useState} from "react";
import {MDBCard, MDBCol, MDBListGroup, MDBListGroupItem, MDBRow} from "mdb-react-ui-kit";
import axios from "../../utils/axios";
import {useNavigate} from "react-router-dom";
import 'react-phone-number-input/style.css'
import ProfilePanel from './components/ProfilePanel'
import AdminPanel from "./components/AdminPanel";
import {AuthContext} from "../../contexts/authContext";

const UserPage = () => {
    const pathname = window.location.pathname;
    const navigate = useNavigate()
    const [isProfileInitialized, setIsProfileInitialized] = useState(false)
    const [isAdminInitialized, setIsAdminInitialized] = useState(false)
    const userInfoRef = useRef({})
    const userListRef = useRef([])
    const {userState} = useContext(AuthContext)

    useEffect(() => {
        axios.get(`v1/user/me`).then((response) => {
            userInfoRef.current = response.data
            setIsProfileInitialized(true)
        })
    }, [])

    useEffect(() => {
        if (/^(admin|pm)$/.test(userState.user.userRole)) {
            axios.get(`v1/user/users`).then((response) => {
                userListRef.current = response.data
                setIsAdminInitialized(true)
            })
        }
    }, [userState])

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
                {/^(admin|pm)$/.test(userState.user.userRole) &&
                    <MDBListGroupItem tag={'button'} onClick={() => handleBasicClick('/user/admin')} action
                                      active={basicActive === '/user/admin'}>관리자 화면</MDBListGroupItem>}
            </MDBListGroup>
        </MDBCard>
    }

    const RightPanel = () => {
        if (pathname === '/user') {
            return isProfileInitialized && <ProfilePanel userInfoRef={userInfoRef}/>
        } else if (pathname === '/user/admin') {
            return isAdminInitialized && <AdminPanel userInfoRef={userInfoRef} userListRef={userListRef}/>
        }
    }
    return <div style={{width: '100%', height: 'calc(100vh - 50px)', display: 'flex', justifyContent: 'center'}}>
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

export default UserPage
