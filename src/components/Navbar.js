import {
    MDBBtn,
    MDBCollapse,
    MDBContainer,
    MDBIcon,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarItem,
    MDBNavbarLink,
    MDBNavbarNav,
    MDBNavbarToggler,
} from 'mdb-react-ui-kit';
import {Outlet, useNavigate} from "react-router-dom";
import {useCallback, useState} from "react";
import axios from "../utils/axios";
import {HttpStatusCode} from "axios";

export default function Navbar(props) {
    const [showNavNoTogglerSecond, setShowNavNoTogglerSecond] = useState(false);
    const setAccessToken = props.setAccessToken
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
                            style={{display: (props.fetchAccessTokenCompleted && props.accessToken) ? 'none' : props.fetchAccessTokenCompleted ? '' : 'none'}}
                            onClick={useCallback(() => navigate('/login'), [navigate])}>Login</MDBBtn>
                    <MDBBtn outline color={'link'} className={'text-nowrap'}
                            style={{display: (props.fetchAccessTokenCompleted && props.accessToken) ? '' : 'none'}}
                            onClick={useCallback(() => {
                                axios.post(`/v1/auth/logout`, {}, {
                                    headers: {Authorization: `Bearer ${props.accessToken}`}
                                }).then((response) => {
                                    if (response.status === HttpStatusCode.Ok) {
                                        setAccessToken(null)
                                        navigate('/')
                                    }
                                })
                            }, [navigate, props.accessToken, setAccessToken])}>Logout</MDBBtn>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
        <Outlet/>
    </div>
}
