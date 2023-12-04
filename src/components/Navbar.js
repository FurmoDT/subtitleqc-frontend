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
import {Link, Outlet, useNavigate} from "react-router-dom";
import {useCallback, useContext, useEffect, useState} from "react";
import {AuthContext} from "../contexts/authContext";
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
        <MDBNavbar expand={'lg'} className={'p-0 shadow-0'} style={{backgroundColor: '#f7f8fc', minHeight: '50px'}}>
            <MDBContainer fluid>
                <MDBNavbarBrand href={`${props.basename}`}>
                    <img src='/furmo-logo.png' width={'40'} height={'30'} alt='' className={'m-0'}/>
                </MDBNavbarBrand>
                <MDBNavbarToggler onClick={() => setShowNavNoTogglerSecond(!showNavNoTogglerSecond)}>
                    <MDBIcon icon='bars' fas/>
                </MDBNavbarToggler>
                <MDBCollapse navbar show={showNavNoTogglerSecond}>
                    <MDBNavbarNav className='mb-0'>
                        <MDBNavbarItem>
                            <Link className={`nav-link ${activeNav === '/tasks' ? 'active active-furmo' : ''}`}
                                  to={'/'}>MAIN</Link>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <Link className={`nav-link ${activeNav.startsWith('/video') ? 'active active-furmo' : ''}`}
                                  to={activeNav.startsWith('/video') ? null : '/video'}>VIDEO</Link>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <Link className={`nav-link ${activeNav.startsWith('/text') ? 'active active-furmo' : ''}`}
                                  to={activeNav.startsWith('/text') ? null : '/text'}>TEXT</Link>
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
                    <MDBDropdown style={{display: userState.isAuthenticated ? '' : 'none', color: 'black'}}>
                        <MDBDropdownToggle tag={'section'}
                                           onMouseEnter={(event) => event.target.style.cursor = 'pointer'}>
                            <span className={'me-2'}>{`${userState.user?.userEmail} 님`}</span>
                            <MDBIcon fas icon="user-circle" size={'xl'} color={'black-50'}/>
                        </MDBDropdownToggle>
                        <MDBDropdownMenu responsive={'end'}>
                            <MDBDropdownItem link href={null} onClick={useCallback(() => {
                                navigate('/user')
                            }, [navigate])}>내 프로필</MDBDropdownItem>
                            <MDBDropdownItem divider/>
                            <MDBDropdownItem link onClick={useCallback(() => {
                                axios.post(`v1/auth/logout`, {}).then((response) => {
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
