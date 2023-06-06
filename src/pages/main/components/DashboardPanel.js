import {MDBBtn, MDBCard, MDBCardBody, MDBCardText, MDBCardTitle, MDBCol, MDBRow} from "mdb-react-ui-kit";
import {AgGridReact} from "ag-grid-react";
import {useRef, useState} from "react";
import DatePickerComponent from "./DatePickerComponent";
import {subDays} from 'date-fns'

const DashboardPanel = () => {
    const gridRef = useRef(null)
    const [rowData, setRowData] = useState([{id: 1, task: '프로그램 회차 언어쌍', endAt: 'YYYY-MM-DD', status: '🟡진행중'}]);
    const [startAt, setStartAt] = useState(subDays(new Date(), 7));
    const [endAt, setEndAt] = useState(new Date());
    const columnDefs = [
        {field: 'id', editable: false, sort: 'asc'},
        {field: 'task', headerComponent: () => <div className={'custom-header'}><span>태스크</span></div>},
        {field: 'endAt', headerComponent: () => <div className={'custom-header'}><span>마감기한</span></div>},
        {field: 'status', headerComponent: () => <div className={'custom-header'}><span>상태</span></div>},
    ]

    return <div style={{padding: '5rem', width: '100%', height: '100%'}}>
        <div className={'d-flex justify-content-end'}>
            <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt} setEndAt={setEndAt}/>
        </div>
        <MDBRow style={{justifyContent: 'center', height: '100%'}}>
            <MDBCol lg={'5'} style={{height: '50%'}}>
                <div className="ag-theme-alpine" style={{height: '100%'}}>
                    <AgGridReact ref={gridRef} columnDefs={columnDefs} defaultColDef={{resizable: true, sortable: true}}
                                 rowData={rowData} onFirstDataRendered={() => gridRef.current.api.sizeColumnsToFit({
                        columnLimits: [
                            {key: 'id', maxWidth: 80}, {key: 'endAt', maxWidth: 130}, {key: 'status', maxWidth: 100}
                        ]
                    })}>
                    </AgGridReact>
                </div>
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
