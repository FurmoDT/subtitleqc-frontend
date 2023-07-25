import {useContext, useEffect, useState} from "react";
import DataGrid from "react-data-grid";
import axios from "../../../utils/axios";
import {fileType, formatTimestamp} from "../../../utils/functions";
import {MDBBtn} from "mdb-react-ui-kit";
import {AuthContext} from "../../../utils/authContext";
import {useNavigate} from "react-router-dom";
import {languageCodes, workType} from "../../../utils/config";

const TaskGridComponent = ({startAt, endAt}) => {
    const [initialized, setInitialized] = useState(false)
    const {userState} = useContext(AuthContext)
    const navigate = useNavigate()
    let columns
    const [rows, setRows] = useState(null)

    if (userState.user.userRole === 'client') {
        columns = [
            {key: 'no', name: 'No', width: 60},
            {key: 'pm', name: 'PM'},
            {key: 'taskName', name: '태스크명'},
            {key: 'type', name: '소재'},
            {key: 'sourceLanguage', name: '출발어'},
            {key: 'targetLanguage', name: '도착어'},
            {key: 'requestedAt', name: '의뢰일'},
            {key: 'endedAt', name: '완료일'},
            {key: 'dueDate', name: '납품기한'},
            {key: 'memo', name: '메모'},
            {key: 'status', name: '상태'},
            {key: '-', name: ''},
        ];
    } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
        columns = [
            {key: 'no', name: 'No', width: 60},
            {key: 'client', name: 'Client'},
            {key: 'pm', name: 'PM'},
            {key: 'pd', name: 'PD'},
            {key: 'projectCode', name: '프로젝트 코드'},
            {key: 'projectName', name: '프로젝트명'},
            {key: 'group', name: '그룹'},
            {key: 'taskName', name: '태스크명'},
            {key: 'type', name: '소재', renderCell: (row) => <div>{row.row.type?.toUpperCase()}</div>},
            {key: 'work', name: '작업'},
            {key: 'worker', name: '작업자'},
            {key: 'sourceLanguage', name: '출발어'},
            {key: 'targetLanguage', name: '도착어'},
            {key: 'requestedAt', name: '의뢰일'},
            {key: 'createdAt', name: '생성일'},
            {key: 'endedAt', name: '완료일'},
            {key: 'dueDate', name: '납품기한'},
            {key: 'memo', name: '메모'},
            {key: 'status', name: '상태'},
            {
                key: '-',
                name: '',
                renderCell: (row) => Object.keys(row.row.extra.pd).includes(`${userState.user.userId}`) ?
                    <><MDBBtn color={'link'} onClick={() => {
                        navigate(`/${row.row.type}/${row.row.extra.hashedId}`)
                    }} disabled={!row.row.type}>이동하기</MDBBtn>
                        <div className={'mx-1'}/>
                        <MDBBtn color={'link'} disabled>수정하기</MDBBtn>
                    </> : null
            },
        ]
    } else {
        columns = [
            {key: 'no', name: 'No', width: 60},
            {key: 'client', name: 'Client'},
            {key: 'pd', name: 'PD'},
            {key: 'taskName', name: '프로그램'},
            {key: 'type', name: '소재'},
            {key: 'work', name: '작업'},
            {key: 'sourceLanguage', name: '출발어'},
            {key: 'targetLanguage', name: '도착어'},
            {key: 'createdAt', name: '생성일'},
            {key: 'endedAt', name: '완료일'},
            {key: 'dueDate', name: '납품기한'},
            {key: 'memo', name: '메모'},
            {key: 'status', name: '상태'},
            {key: '-', name: ''},
        ]
    }

    useEffect(() => {
        setInitialized(false)
        if (userState.user.userRole === 'client') {
        } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
            axios.get('v1/project/task/pm', {
                params: {
                    start_date: startAt,
                    end_date: endAt,
                }
            }).then((response) => {
                console.log(response.data)
                setRows(response.data.map((item, index) => {
                    const pd = JSON.parse(item.pd)
                    return {
                        no: index + 1,
                        client: item.client_name,
                        pm: item.pm_name,
                        pd: Object.values(pd).join(','),
                        projectCode: item.project_code,
                        projectName: item.project_name,
                        group: item.task_group_key,
                        taskName: `${item.task_name}_${item.task_episode}`,
                        type: fileType(item.task_file_extension),
                        work: workType[item.work_type],
                        worker: item.worker_name,
                        sourceLanguage: languageCodes[item.work_source_language],
                        targetLanguage: languageCodes[item.work_target_language],
                        createdAt: formatTimestamp(item.task_created_at),
                        dueDate: formatTimestamp(item.task_due_date),
                        memo: item.task_memo,
                        extra: {pmId: item.pm_id, pd: pd, hashedId: item.task_hashed_id}
                    }
                }))
            })
        } else {
        }
    }, [userState.user.userRole, startAt, endAt])

    useEffect(() => {
        if (rows) setInitialized(true)
    }, [rows])

    return initialized &&
        <DataGrid className={'rdg-light fill-grid'} style={{height: '100%'}} columns={columns} rows={rows}
                  rowHeight={(args) => 45}/>
}

export default TaskGridComponent
