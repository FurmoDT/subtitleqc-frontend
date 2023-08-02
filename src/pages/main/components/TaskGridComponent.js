import {useContext, useEffect, useState} from "react";
import DataGrid from "react-data-grid";
import axios from "../../../utils/axios";
import {fileType, formatTimestamp} from "../../../utils/functions";
import {MDBBtn} from "mdb-react-ui-kit";
import {AuthContext} from "../../../utils/authContext";
import {useNavigate} from "react-router-dom";
import {languageCodes, workType} from "../../../utils/config";
import ModifyModal from "./dialogs/ModifyModal";

const TaskGridComponent = ({startAt, endAt}) => {
    const [initialized, setInitialized] = useState(false)
    const {userState} = useContext(AuthContext)
    const navigate = useNavigate()
    let columns
    const [rows, setRows] = useState(null)
    const [taskAndWork, setTaskAndWork] = useState(null)
    const [modifyTaskHashedId, setModifyTaskHashedId] = useState(null)

    const groupBy = (arr, keyFunc) => {
        return arr.reduce((result, current) => {
            const key = keyFunc(current);
            const pd = JSON.parse(current.pd)
            if (!result[key]) {
                result[key] = {
                    task: {
                        client: current.client_name,
                        pm: current.pm_name,
                        pd: Object.values(pd).join(','),
                        projectCode: current.project_code,
                        projectName: current.project_name,
                        group: current.task_group_key,
                        taskName: `${current.task_name}_${current.task_episode}`,
                        taskType: fileType(current.task_file_extension),
                        createdAt: formatTimestamp(current.task_created_at),
                        dueDate: formatTimestamp(current.task_due_date),
                        memo: current.task_memo,
                        extra: {hashedId: current.task_hashed_id, pmId: current.pm_id, pd: pd},
                    },
                    work: []
                };
            }
            if (current.work_id) result[key].work.push({
                workType: workType[current.work_type],
                worker: current.worker_name,
                workDueDate: formatTimestamp(current.work_due_date),
                sourceLanguage: languageCodes[current.work_source_language],
                targetLanguage: languageCodes[current.work_target_language],
                memo: current.work_memo
            });
            return result;
        }, {});
    }

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
        const WorkGrid = ({hashedId}) => {
            const work = taskAndWork[hashedId].work
            return work.length ? (<DataGrid className={'rdg-light fill-grid'} style={{width: '50%', height: '100%'}}
                                            rows={work} rowHeight={() => 45} columns={[
                {key: 'workType', name: '작업'}, {key: 'worker', name: '작업자'},
                {key: 'sourceLanguage', name: '출발어'}, {key: 'targetLanguage', name: '도착어'},
                {key: 'workDueDate', name: '마감일'}, {key: 'memo', name: '메모'}]}/>) : null
        }
        columns = [
            {
                key: 'expanded', name: '', width: 40, minWidth: 40, maxWidth: 40, resizable: false,
                colSpan: (args) => args.type === 'ROW' && args.row.type === 'DETAIL' ? 17 : undefined,
                cellClass: (row) => row.type === 'DETAIL' ? 'rdg-detail-cell' : undefined,
                renderCell: ({row, tabIndex, onRowChange}) => {
                    if (row.type === 'DETAIL') {
                        return <WorkGrid hashedId={row.hashedId}/>
                    }
                    return <div><span onClick={() => onRowChange({...row, expanded: !row.expanded})}>
                        <span tabIndex={tabIndex}>{row.expanded ? '\u25BC' : '\u25B6'}</span></span></div>
                }
            },
            {key: 'no', name: 'No', width: 60},
            {key: 'client', name: 'Client'},
            {key: 'pm', name: 'PM'},
            {key: 'pd', name: 'PD'},
            {key: 'projectCode', name: '프로젝트 코드'},
            {key: 'projectName', name: '프로젝트명'},
            {key: 'group', name: '그룹'},
            {key: 'taskName', name: '태스크명'},
            {key: 'taskType', name: '소재', renderCell: (row) => <div>{row.row.taskType?.toUpperCase()}</div>},
            {key: 'requestedAt', name: '의뢰일'},
            {key: 'createdAt', name: '생성일'},
            {key: 'endedAt', name: '완료일'},
            {key: 'dueDate', name: '납품기한'},
            {key: 'memo', name: '메모'},
            {key: 'status', name: '상태'},
            {
                key: '-',
                name: '',
                renderCell: (row) => row.row.type === 'MASTER' && (row.row.extra.pmId === userState.user.userId || Object.keys(row.row.extra.pd).includes(`${userState.user.userId}`)) ?
                    <><MDBBtn color={'link'} onClick={() => {
                        navigate(`/${row.row.taskType}/${row.row.extra.hashedId}`)
                    }} disabled={!row.row.taskType}>이동하기</MDBBtn>
                        <div className={'mx-1'}/>
                        <MDBBtn color={'link'} onClick={() => {
                            setModifyTaskHashedId(row.row.extra.hashedId)
                        }}>수정하기</MDBBtn>
                    </> : null,
                width: 210,
                maxWidth: 210,
                minWidth: 210
            },
        ]
    } else {
        columns = [
            {key: 'no', name: 'No', width: 60},
            {key: 'client', name: 'Client'},
            {key: 'pd', name: 'PD'},
            {key: 'taskName', name: '태스크명'},
            {key: 'taskType', name: '소재', renderCell: (row) => <div>{row.row.taskType?.toUpperCase()}</div>},
            {key: 'workType', name: '작업'},
            {key: 'sourceLanguage', name: '출발어'},
            {key: 'targetLanguage', name: '도착어'},
            {key: 'createdAt', name: '생성일'},
            {key: 'endedAt', name: '완료일'},
            {key: 'dueDate', name: '마감일'},
            {key: 'memo', name: '메모'},
            {key: 'status', name: '상태'},
            {
                key: '-',
                name: '',
                renderCell: (row) => <><MDBBtn color={'link'} onClick={() => {
                    navigate(`/${row.row.taskType}/${row.row.extra.hashedId}`)
                }} disabled={!row.row.taskType}>이동하기</MDBBtn>
                    <div className={'mx-1'}/>
                    <MDBBtn color={'link'} onClick={() => {
                        console.log(row.row.extra.hashedId)
                    }}>수정하기</MDBBtn>
                </>,
                width: 210,
                maxWidth: 210,
                minWidth: 210
            },
        ]
    }

    useEffect(() => {
        setInitialized(false)
        if (userState.user.userRole === 'client') {
        } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
            axios.get('v1/project/task/pm', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
                setTaskAndWork(groupBy(response.data, (item) => item.task_hashed_id))
            })
        } else {
            axios.get('v1/project/task/worker', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
                console.log(response.data)
                setRows(response.data.map((item, index) => {
                    const pd = JSON.parse(item.pd)
                    return {
                        no: index + 1,
                        client: item.client_name,
                        pd: Object.values(pd).join(','),
                        taskName: `${item.task_name}_${item.task_episode}`,
                        taskType: fileType(item.task_file_extension),
                        workType: workType[item.work_type],
                        sourceLanguage: languageCodes[item.work_source_language],
                        targetLanguage: languageCodes[item.work_target_language],
                        createdAt: formatTimestamp(item.work_created_at),
                        dueDate: formatTimestamp(item.work_due_date),
                        memo: item.work_memo,
                        extra: {hashedId: item.task_hashed_id, pd: pd}
                    }
                }))
            })
        }
    }, [userState.user.userRole, startAt, endAt])

    useEffect(() => {
        if (!taskAndWork) return
        setRows(Object.values(taskAndWork).reduce((result, current, currentIndex) => {
            result.push({...current.task, expanded: true, type: 'MASTER', no: currentIndex + 1})
            result.push({type: 'DETAIL', hashedId: current.task.extra.hashedId})
            return result
        }, []))
    }, [taskAndWork])

    useEffect(() => {
        if (rows) setInitialized(true)
    }, [rows])

    function onRowsChange(rows, {indexes}) {
        const row = rows[indexes[0]];
        if (row.type === 'MASTER') {
            if (row.expanded) {
                rows.splice(indexes[0] + 1, 0, {
                    type: 'DETAIL',
                    hashedId: row.extra.hashedId
                })
            } else {
                rows.splice(indexes[0] + 1, 1);
            }
            setRows(rows);
        }
    }

    return initialized && <>
        <DataGrid className={'rdg-light fill-grid'} style={{height: '100%'}} columns={columns} rows={rows}
                  rowHeight={(args) => {
                      return args.row.type === 'DETAIL' ? 70 + taskAndWork?.[args.row.hashedId].work.length * 45 : 45
                  }}
                  onRowsChange={onRowsChange}/>
        <ModifyModal hashedId={modifyTaskHashedId} setHashedId={setModifyTaskHashedId}/>
    </>
}

export default TaskGridComponent
