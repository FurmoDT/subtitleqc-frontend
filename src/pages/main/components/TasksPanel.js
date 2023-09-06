import {useContext, useState} from "react";
import DatePickerComponent from "./DatePickerComponent";
import {addMonths} from 'date-fns'
import {MDBCol, MDBRow} from "mdb-react-ui-kit";
import {AuthContext} from "../../../utils/authContext";
import RequestModal from "./dialogs/RequestModal";
import RegisterModal from "./dialogs/RegisterModal";
import TaskGridComponent from "./TaskGridComponent";

const TasksPanel = () => {
    const [startAt, setStartAt] = useState(new Date().setHours(0, 0, 0, 0));
    const [endAt, setEndAt] = useState(addMonths(new Date(), 1).setHours(23, 59, 59, 999));
    const {userState} = useContext(AuthContext)
    const ModalComponent = () => {
        if (userState.user.userRole === 'client') {
            return <RequestModal/>
        } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
            return <RegisterModal/>
        } else return null
    }

    return <div style={{padding: '5rem', width: 'calc(100vw - 50px)', height: '100%', textAlign: 'center'}}>
        <MDBRow style={{marginBottom: '0.5rem'}}>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'end'}}>
                <ModalComponent/>
            </MDBCol>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'center', alignItems: 'end'}}>
                <div style={{fontWeight: 'bold'}}>태스크 리스트</div>
            </MDBCol>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'flex-end'}}>
                <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt} setEndAt={setEndAt}/>
            </MDBCol>
        </MDBRow>
        <div style={{height: 'calc(100% - 5rem)'}}>
            <TaskGridComponent startAt={startAt} endAt={endAt}/>
        </div>
    </div>
};

export default TasksPanel
