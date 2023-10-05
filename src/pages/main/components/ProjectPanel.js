import {useEffect, useState} from "react";
import {addMonths} from 'date-fns'
import {MDBCol, MDBRow} from "mdb-react-ui-kit";
import DatePickerComponent from "./DatePickerComponent";
import ProjectGridComponent from "./ProjectGridComponent";
import RegisterModal from "./dialogs/project/RegisterModal";

const ProjectPanel = () => {
    const [startAt, setStartAt] = useState(null);
    const [endAt, setEndAt] = useState(null);

    useEffect(()=>{
        setStartAt(parseInt(window.sessionStorage.getItem('project-start-at')) || new Date().setHours(0, 0, 0, 0))
        setEndAt(parseInt(window.sessionStorage.getItem('project-end-at')) || addMonths(new Date(), 1).setHours(23, 59, 59, 999))
    }, [])

    useEffect(()=>{
        startAt && window.sessionStorage.setItem('project-start-at', `${startAt}`);
    }, [startAt])

    useEffect(()=>{
        endAt && window.sessionStorage.setItem('project-end-at', `${endAt}`);
    }, [endAt])

    return <div style={{padding: '5rem', width: 'calc(100vw - 50px)', height: '100%', textAlign: 'center'}}>
        <MDBRow style={{marginBottom: '0.5rem'}}>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'flex-start', alignItems: 'end'}}>
                <RegisterModal/>
            </MDBCol>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'center', alignItems: 'end'}}>
                <div style={{fontWeight: 'bold'}}>태스크 리스트</div>
            </MDBCol>
            <MDBCol sm={4} style={{display: 'flex', justifyContent: 'flex-end'}}>
                <DatePickerComponent startAt={startAt} setStartAt={setStartAt} endAt={endAt} setEndAt={setEndAt}/>
            </MDBCol>
        </MDBRow>
        <div style={{height: 'calc(100% - 5rem)'}}>
            <ProjectGridComponent startAt={startAt} endAt={endAt}/>
        </div>
    </div>
};

export default ProjectPanel
