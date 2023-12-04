import {useEffect, useState} from "react";
import {addMonths} from 'date-fns'
import {MDBCol, MDBRow} from "mdb-react-ui-kit";
import DatePickerComponent from "./DatePickerComponent";
import ProjectGridComponent from "./ProjectGridComponent";
import RegisterModal from "./dialogs/project/RegisterModal";

const ProjectPanel = () => {
    const [startAt, setStartAt] = useState(null);
    const [endAt, setEndAt] = useState(null);

    useEffect(() => {
        setStartAt(parseInt(window.sessionStorage.getItem('project-start-at')) || new Date().setHours(0, 0, 0, 0))
        setEndAt(parseInt(window.sessionStorage.getItem('project-end-at')) || addMonths(new Date(), 1).setHours(23, 59, 59, 999))
    }, [])

    useEffect(() => {
        startAt && window.sessionStorage.setItem('project-start-at', `${startAt}`);
    }, [startAt])

    useEffect(() => {
        endAt && window.sessionStorage.setItem('project-end-at', `${endAt}`);
    }, [endAt])

    return <div className={'h-100 text-center px-2'} style={{width: 'calc(100vw - 4rem)'}}>
        <div className={'w-100 h-100 p-2 bg-white rounded-5'}>
            <MDBRow className={'mb-2 d-flex align-items-center'}>
                <MDBCol sm={4} className={'d-flex justify-content-start align-items-end'}>
                    <RegisterModal/>
                </MDBCol>
                <MDBCol sm={4} className={'d-flex justify-content-center align-items-end'}>
                    <div className={'fw-bold'}>프로젝트 리스트</div>
                </MDBCol>
                <MDBCol sm={4} className={'d-flex justify-content-end'}>
                    <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt} setEndAt={setEndAt}/>
                </MDBCol>
            </MDBRow>
            <div style={{height: 'calc(100% - 5rem)'}}>
                <ProjectGridComponent startAt={startAt} endAt={endAt}/>
            </div>
        </div>
    </div>
};

export default ProjectPanel
