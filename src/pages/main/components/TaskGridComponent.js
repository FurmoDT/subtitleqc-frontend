import {useEffect, useState} from "react";
import DataGrid from "react-data-grid";
import axios from "../../../utils/axios";
import {formatTimestamp} from "../../../utils/functions";

const TaskGridComponent = ({role, startAt, endAt}) => {
    let columns
    const [rows, setRows] = useState([])
    if (role === 'client') {
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
    } else if (/^(admin|pm)$/.test(role)) {
        columns = [
            {key: 'no', name: 'No', width: 60},
            {key: 'client', name: 'Client'},
            {key: 'pm', name: 'PM'},
            {key: 'pd', name: 'PD'},
            {key: 'projectCode', name: '프로젝트 코드'},
            {key: 'projectName', name: '프로젝트명'},
            {key: 'projectGroup', name: '그룹'},
            {key: 'type', name: '소재'},
            {key: 'work', name: '작업'},
            {key: 'sourceLanguage', name: '출발어'},
            {key: 'targetLanguage', name: '도착어'},
            {key: 'requestedAt', name: '의뢰일'},
            {key: 'createdAt', name: '생성일'},
            {key: 'endedAt', name: '완료일'},
            {key: 'dueDate', name: '납품기한'},
            {key: 'memo', name: '메모', resizable: true},
            {key: 'status', name: '상태'},
            {key: '-', name: ''},
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
        if (role === 'client') {
        } else if (/^(admin|pm)$/.test(role)) {
            axios.get('v1/project/task/pm', {
                params: {
                    start_date: startAt,
                    end_date: endAt,
                }
            }).then((response) => {
                console.log(response.data)
                setRows(response.data.map((item, index) => {
                    return {
                        no: index + 1,
                        client: 'client',
                        pm: item.pm_id,
                        pd: item.pd_id,
                        projectCode: item.project_code,
                        projectName: item.project_name,
                        projectGroup: item.project_group,
                        type: item.type,
                        work: item.work,
                        createdAt: formatTimestamp(item.task_created_at),
                        dueDate: formatTimestamp(item.task_due_date),
                        memo: item.task_memo
                    }
                }))
            })
        } else {
        }
    }, [startAt, endAt])
    return <DataGrid className={'rdg-light fill-grid'} style={{height: '100%'}} columns={columns} rows={rows}
                     rowHeight={(args) => 45}/>
}

export default TaskGridComponent
