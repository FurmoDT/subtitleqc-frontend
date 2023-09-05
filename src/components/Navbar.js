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
import {useCallback, useContext, useEffect, useState} from "react";
import {AuthContext} from "../utils/authContext";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";

export default function Navbar(props) {
    const [showNavNoTogglerSecond, setShowNavNoTogglerSecond] = useState(false);
    const {userState, updateAccessToken} = useContext(AuthContext);
    const [activeNav, setActiveNav] = useState('')
    const navigate = useNavigate()
    useEffect(() => {
        setActiveNav(window.location.pathname)
    }, [navigate])
    return <>
        <MDBNavbar expand={'lg'} dark style={{backgroundColor: '#121212ff', padding: 0, minHeight: '50px'}}>
            <MDBContainer fluid style={{paddingLeft: 5}}>
                <MDBNavbarBrand href={`${props.basename}`}
                                style={{width: '40px', height: '35px', backgroundColor: 'white'}}>
                    <img src='/furmo-logo.png' width={'40'} height={'33'} alt='' style={{margin: '0 auto'}}/>
                </MDBNavbarBrand>
                <MDBNavbarToggler onClick={() => setShowNavNoTogglerSecond(!showNavNoTogglerSecond)}>
                    <MDBIcon icon='bars' fas/>
                </MDBNavbarToggler>
                <MDBCollapse navbar show={showNavNoTogglerSecond}>
                    <MDBNavbarNav className='mr-auto mb-2 mb-lg-0'>
                        <MDBNavbarItem>
                            <MDBNavbarLink active={activeNav === '/'} onClick={useCallback(() => {
                                navigate('/')
                            }, [navigate])}>MAIN</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink active={activeNav.startsWith('/video')} onClick={useCallback(() => {
                                if (!activeNav.startsWith('/video')) navigate('/video')
                            }, [navigate, activeNav])}>VIDEO</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink active={activeNav.startsWith('/text')} onClick={useCallback(() => {
                                if (!activeNav.startsWith('/text')) navigate('/text')
                            }, [navigate, activeNav])}>TEXT</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={() => window.open('https://www.subtitleqc.com')}>QC</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={() => window.open('https://docs.google.com/presentation/d/14zk9I95cR7y-E8ujeheKwtvlXKsnK4c0nUhUDyyUh0s/edit?usp=sharing')}>MANUAL</MDBNavbarLink>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                    <MDBBtn outline color={'link'} className={'text-nowrap'}
                            style={{display: userState.isAuthenticated ? 'none' : ''}}
                            onClick={useCallback(() => navigate('/login'), [navigate])}>로그인</MDBBtn>
                    <MDBDropdown style={{display: userState.isAuthenticated ? '' : 'none', color: 'white'}}>
                        <MDBDropdownToggle tag={'section'}
                                           onMouseEnter={(event) => event.target.style.cursor = 'pointer'}>
                            <label style={{marginRight: '5px', fontSize: '1rem'}}>
                                {userState.user?.userEmail} 님
                            </label>
                            <MDBIcon fas icon="user-circle" size={'xl'} color={'white-50'}/>
                        </MDBDropdownToggle>
                        <MDBDropdownMenu responsive={'end'}>
                            <MDBDropdownItem link href={null} onClick={useCallback(() => {
                                navigate('/user')
                            }, [navigate])}>내 프로필</MDBDropdownItem>
                            <MDBDropdownItem divider/>
                            <MDBDropdownItem link onClick={useCallback(() => {
                                axios.post(`/v1/auth/logout`, {}).then((response) => {
                                    if (response.status === HttpStatusCode.Ok) {
                                        updateAccessToken(null).then(() => navigate('/', {replace: true}))
                                    }
                                })
                            }, [navigate, updateAccessToken])}>로그아웃</MDBDropdownItem>
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
        <Outlet/>
    </>
}
