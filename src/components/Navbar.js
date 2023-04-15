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
                                onClick={useCallback(() => navigate('/qc'), [navigate])}>QC</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={useCallback(() => navigate('/manual'), [navigate])}>Manual</MDBNavbarLink>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                    <MDBBtn outline color={'link'} className={'text-nowrap'}
                            style={{display: props.userAuth.accessToken ? 'none' : ''}}
                            onClick={useCallback(() => navigate('/login'), [navigate])}>Login</MDBBtn>
                    <MDBBtn outline color={'link'} className={'text-nowrap'}
                            style={{display: props.userAuth.accessToken ? '' : 'none'}}
                            onClick={useCallback(() => {
                                axios.post(`/v1/auth/logout`, {}, {
                                    headers: {Authorization: props.userAuth.accessToken},
                                }).then((response) => {
                                    if (response.status === HttpStatusCode.Ok) {
                                        props.userAuth.accessToken = null
                                        navigate('/')
                                    }
                                })
                            }, [navigate, props.userAuth])}>Logout</MDBBtn>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
        <Outlet/>
    </div>
}
