import {
    MDBBtn,
    MDBCollapse,
    MDBContainer,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBIcon,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarItem,
    MDBNavbarLink,
    MDBNavbarNav,
    MDBNavbarToggler,
} from 'mdb-react-ui-kit';
import {Outlet, useNavigate} from "react-router-dom";
import {useCallback, useContext, useState} from "react";
import {AuthContext} from "../utils/authContext";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";

export default function Navbar(props) {
    const [showNavNoTogglerSecond, setShowNavNoTogglerSecond] = useState(false);
    const {userState, setUserState, fetchAccessTokenCompleted} = useContext(AuthContext);
    const navigate = useNavigate()
    return <div>
        <MDBNavbar expand='lg' light bgColor='light'>
            <MDBContainer fluid>
                <MDBNavbarBrand href={`${props.basename}`}>SubtitleQC</MDBNavbarBrand>
                <MDBNavbarToggler onClick={() => setShowNavNoTogglerSecond(!showNavNoTogglerSecond)}>
                    <MDBIcon icon='bars' fas/>
                </MDBNavbarToggler>
                <MDBCollapse navbar show={showNavNoTogglerSecond}>
                    <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={useCallback(() => navigate('/production'), [navigate])}>Production</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={() => window.open('https://www.subtitleqc.com')}>QC</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={() => window.open('https://docs.google.com/presentation/d/14zk9I95cR7y-E8ujeheKwtvlXKsnK4c0nUhUDyyUh0s/edit?usp=sharing')}>Manual</MDBNavbarLink>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                    <MDBBtn outline color={'link'} className={'text-nowrap'}
                            style={{display: (fetchAccessTokenCompleted && userState.accessToken) ? 'none' : fetchAccessTokenCompleted ? '' : 'none'}}
                            onClick={useCallback(() => navigate('/login'), [navigate])}>로그인</MDBBtn>
                    <MDBDropdown style={{display: (fetchAccessTokenCompleted && userState.accessToken) ? '' : 'none'}}>
                        <MDBDropdownToggle tag={'section'}
                                           onMouseEnter={(event) => event.target.style.cursor = 'pointer'}>
                            <label style={{marginRight: '5px', fontSize: 15}}>
                                {userState.user?.userName} 님
                            </label>
                            <MDBIcon fas icon="user-circle" size={'xl'} color={'black-50'}/>
                        </MDBDropdownToggle>
                        <MDBDropdownMenu>
                            <MDBDropdownItem link href={null} onClick={useCallback(() => {
                                navigate('/profile')
                            }, [navigate])}>내 프로필</MDBDropdownItem>
                            <MDBDropdownItem divider/>
                            <MDBDropdownItem link onClick={useCallback(() => {
                                axios.post(`/v1/auth/logout`, {}).then((response) => {
                                    if (response.status === HttpStatusCode.Ok) {
                                        setUserState({...userState, accessToken: null})
                                        navigate('/')
                                    }
                                })
                            }, [navigate, userState, setUserState])}>로그아웃</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
        <Outlet/>
    </div>
}
