import {MDBBtn, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBCol, MDBRow} from "mdb-react-ui-kit";
import {AgGridReact} from "ag-grid-react";

const DashboardPanel = () => {
    return <div style={{padding: '5rem', width: '100%', height: '100%'}}>
        <MDBRow style={{justifyContent: 'center', height: '100%'}}>
            <MDBCol lg={'5'} style={{height: '50%'}}>
                <div className="ag-theme-alpine" style={{height: '100%'}}>
                    <AgGridReact columnDefs={[{field: 'id'}]} rowData={[{id: 1}]}>
                    </AgGridReact>
                </div>
            </MDBCol>
            <MDBCol md={'7'}>
                <MDBRow style={{marginBottom: '2rem'}}>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>프로젝트 카드</MDBCardTitle>
                                <MDBCardText>sample</MDBCardText>
                                <MDBBtn>Button</MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>프로젝트 카드</MDBCardTitle>
                                <MDBCardText>sample</MDBCardText>
                                <MDBBtn>Button</MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
                <MDBRow style={{marginBottom: '2rem'}}>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>프로젝트 카드</MDBCardTitle>
                                <MDBCardText>sample</MDBCardText>
                                <MDBBtn>Button</MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>프로젝트 카드</MDBCardTitle>
                                <MDBCardText>sample</MDBCardText>
                                <MDBBtn>Button</MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBCol>
        </MDBRow>
    </div>
};

export default DashboardPanel
