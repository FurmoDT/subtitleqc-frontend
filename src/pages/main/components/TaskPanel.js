import {useCallback, useContext, useEffect, useState} from "react";
import DatePickerComponent from "./DatePickerComponent";
import {addMonths} from 'date-fns'
import {MDBCol, MDBRow} from "mdb-react-ui-kit";
import {AuthContext} from "../../../contexts/authContext";
import RequestModal from "./dialogs/task/RequestModal";
import RegisterModal from "./dialogs/task/RegisterModal";
import TaskGridComponent from "./TaskGridComponent";

const TaskPanel = () => {
    const [startAt, setStartAt] = useState(null);
    const [endAt, setEndAt] = useState(null);
    const {userState} = useContext(AuthContext)
    const [forceRender, setForceRender] = useState(0)

    useEffect(() => {
        setStartAt(parseInt(window.sessionStorage.getItem('task-start-at')) || new Date().setHours(0, 0, 0, 0))
        setEndAt(parseInt(window.sessionStorage.getItem('task-end-at')) || addMonths(new Date(), 1).setHours(23, 59, 59, 999))
    }, [])

    useEffect(() => {
        startAt && window.sessionStorage.setItem('task-start-at', `${startAt}`);
    }, [startAt])

    useEffect(() => {
        endAt && window.sessionStorage.setItem('task-end-at', `${endAt}`);
    }, [endAt])

    const forceRenderer = useCallback(() => {
        setForceRender(prevState => prevState + 1)
    }, [])

    const ModalComponent = () => {
        if (userState.user.userRole === 'client') { // TODO Modal rerender as accessToken refreshed
            return <RequestModal forceRender={forceRenderer}/>
        } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
            return <RegisterModal forceRender={forceRenderer}/>
        } else return null
    }

    return <div className={'h-100 text-center px-2'} style={{width: 'calc(100vw - 4rem)'}}>
        <div className={'w-100 h-100 p-2 bg-white rounded-5'}>
            {userState.user.userRole ? <>
                <MDBRow className={'mb-2 d-flex align-items-center'}>
                    <MDBCol sm={4} className={'d-flex justify-content-start align-items-end'}>
                        <ModalComponent/>
                    </MDBCol>
                    <MDBCol sm={4} className={'d-flex justify-content-center align-items-end'}>
                        <div className={'fw-bold'}>태스크 리스트</div>
                    </MDBCol>
                    <MDBCol sm={4} className={'d-flex justify-content-end'}>
                        <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt}
                                             setEndAt={setEndAt}/>
                    </MDBCol>
                </MDBRow>
                <div style={{height: 'calc(100% - 5rem)'}}>
                    <TaskGridComponent startAt={startAt} endAt={endAt} forceRender={forceRender}
                                       forceRenderer={forceRenderer}/>
                </div>
            </> : <>승인 대기중입니다.</>}
        </div>
    </div>
};

export default TaskPanel
