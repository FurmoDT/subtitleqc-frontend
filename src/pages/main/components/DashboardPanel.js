import {MDBBtn, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBCol, MDBRow} from "mdb-react-ui-kit";
import DataGrid from 'react-data-grid';
import {useState} from "react";
import DatePickerComponent from "./DatePickerComponent";
import {subDays} from 'date-fns'

const DashboardPanel = () => {
    const [startAt, setStartAt] = useState(subDays(new Date(), 7));
    const [endAt, setEndAt] = useState(new Date());
    const columns = [
        {key: 'id', name: 'id', resizable: true, width: 80},
        {key: 'task', name: '태스크', resizable: true},
        {key: 'endAt', name: '마감기한', resizable: false, width: 130},
        {key: 'status', name: '상태', resizable: false, width: 'max-content'}
    ];
    const rows = [
        {id: 1, task: '프로그램 회차 언어쌍', endAt: 'YYYYMMDD-HH', status: '🟡진행중'},
    ];

    return <div style={{padding: '5rem', width: '100%', height: '100%'}}>
        <div className={'d-flex justify-content-end'}>
            <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt} setEndAt={setEndAt}/>
        </div>
        <MDBRow style={{justifyContent: 'center', height: '100%'}}>
            <MDBCol lg={'5'} style={{height: '50%'}}>
                <DataGrid className={'rdg-light fill-grid'} columns={columns} rows={rows}/>
            </MDBCol>
            <MDBCol md={'7'}>
                <MDBRow style={{marginBottom: '2rem'}}>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>테스크 카드</MDBCardTitle>
                                <MDBCardText>sample</MDBCardText>
                                <MDBBtn>Button</MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>테스크 카드</MDBCardTitle>
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
                                <MDBCardTitle>테스크 카드</MDBCardTitle>
                                <MDBCardText>sample</MDBCardText>
                                <MDBBtn>Button</MDBBtn>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                    <MDBCol>
                        <MDBCard>
                            <MDBCardBody>
                                <MDBCardTitle>테스크 카드</MDBCardTitle>
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
