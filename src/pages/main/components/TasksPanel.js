import {AgGridReact} from "ag-grid-react";
import {useContext, useRef, useState} from "react";
import DatePickerComponent from "./DatePickerComponent";
import {subDays} from 'date-fns'
import {MDBCol, MDBRow} from "mdb-react-ui-kit";
import {AuthContext} from "../../../utils/authContext";
import RequestModal from "./dialogs/RequestModal";
import TaskModal from "./dialogs/TaskModal";

const TasksPanel = () => {
    const gridRef = useRef(null)
    const [rowData, setRowData] = useState([]);
    const [startAt, setStartAt] = useState(subDays(new Date(), 7));
    const [endAt, setEndAt] = useState(new Date());
    const {userState} = useContext(AuthContext)
    const columnDefs = []
    return <div style={{padding: '5rem', width: '100%', height: '100%', textAlign: 'center'}}>
        <MDBRow>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'end'}}>
                {userState.user.userRole === 'client' ?
                    <RequestModal/> : /^(admin|pm)$/.test(userState.user.userRole) ? <TaskModal/> : null}
            </MDBCol>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'center', alignItems: 'end'}}>
                <div>태스크 리스트</div>
            </MDBCol>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'flex-end'}}>
                <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt} setEndAt={setEndAt}/>
            </MDBCol>
        </MDBRow>
        <div className="ag-theme-alpine" style={{height: 'calc(100% - 5rem)'}}>
            <AgGridReact ref={gridRef} columnDefs={columnDefs} defaultColDef={{resizable: true, sortable: true}}
                         rowData={rowData}>
            </AgGridReact>
        </div>
    </div>
};

export default TasksPanel
