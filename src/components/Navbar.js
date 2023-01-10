import {
    MDBCollapse,
    MDBContainer,
    MDBNavbar,
    MDBNavbarBrand,
    MDBNavbarItem,
    MDBNavbarLink,
    MDBNavbarNav,
} from 'mdb-react-ui-kit';
import {Outlet, useNavigate} from "react-router-dom";
import {useCallback} from "react";

export default function Navbar(props) {
    const navigate = useNavigate()
    return <div>
        <MDBNavbar expand='lg' light bgColor='light'>
            <MDBContainer fluid>
                <MDBNavbarBrand href={`${props.basename}`}>SubtitleQC</MDBNavbarBrand>
                <MDBCollapse navbar>
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
                    </MDBNavbarNav>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
        <Outlet/>
    </div>
}
