import {
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
                                onClick={useCallback(() => navigate('/production', {replace: true}),
                                    [navigate])}>Production</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={useCallback(() => navigate('/qc', {replace: true}),
                                    [navigate])}>QC</MDBNavbarLink>
                        </MDBNavbarItem>
                        <MDBNavbarItem>
                            <MDBNavbarLink
                                onClick={useCallback(() => navigate('/manual', {replace: true}),
                                    [navigate])}>Manual</MDBNavbarLink>
                        </MDBNavbarItem>
                    </MDBNavbarNav>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
        <Outlet/>
    </div>
}
