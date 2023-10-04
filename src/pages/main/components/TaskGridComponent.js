import {createContext, useContext, useEffect, useMemo, useState} from "react";
import DataGrid from "react-data-grid";
import axios from "../../../utils/axios";
import {fileType, formatTimestamp} from "../../../utils/functions";
import {MDBBtn} from "mdb-react-ui-kit";
import {AuthContext} from "../../../contexts/authContext";
import {languageCodes, workType} from "../../../utils/config";
import ModifyModal from "./dialogs/task/ModifyModal";
import TaskDoneModal from "./dialogs/task/TaskDoneModal";
import WorkUndoneModal from "./dialogs/task/WorkUndoneModal";
import TaskUndoneModal from "./dialogs/task/TaskUndoneModal";

const FilterContext = createContext(undefined);

const TaskGridComponent = ({startAt, endAt, forceRender, forceRenderer}) => {
    const [initialized, setInitialized] = useState(false)
    const {userState} = useContext(AuthContext)
    let columns
    const [rows, setRows] = useState(null)
    const [taskAndWork, setTaskAndWork] = useState(null)
    const [modifyTaskHashedId, setModifyTaskHashedId] = useState(null)
    const [taskDoneHashedId, setTaskDoneHashedId] = useState(null)
    const [taskUndoneHashedId, setTaskUndoneHashedId] = useState(null)
    const [workUndoneHashedId, setWorkUndoneHashedId] = useState(null)
    const [filters, setFilters] = useState({status: 'All'})

    const FilterRenderer = ({tabIndex, column, children}) => {
        return <>
            <div>{column.name}</div>
            <div>{children({tabIndex, filters})}</div>
        </>
    }

    const filteredRows = useMemo(() => {
        if (!rows) return
        return rows.filter((r) => {
            return filters.status !== 'All' ? r.status === filters.status : true
        });
    }, [rows, filters]);

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
                        taskType: fileType(current.task_file_name),
                        createdAt: formatTimestamp(current.task_created_at),
                        endedAt: formatTimestamp(current.task_ended_at),
                        dueDate: formatTimestamp(current.task_due_date),
                        memo: current.task_memo,
                        status: current.task_ended_at ? 'Done' : current.work_id ? 'Ing' : 'New',
                        extra: {hashedId: current.task_hashed_id, pmId: current.pm_id, pd: pd},
                    }, work: []
                };
            }
            if (current.work_id) result[key].work.push({
                workHashedId: current.work_hashed_id,
                workType: workType[current.work_type],
                worker: current.worker_name,
                sourceLanguage: languageCodes[current.work_source_language],
                targetLanguage: languageCodes[current.work_target_language],
                workEndedAt: formatTimestamp(current.work_ended_at),
                workDueDate: formatTimestamp(current.work_due_date),
                workMemo: current.work_memo
            });
            return result;
        }, {});
    }

    const defaultColumns = {
        no: {key: 'no', name: 'No', width: 60},
        pm: {key: 'pm', name: 'PM'}, pd: {key: 'pd', name: 'PD'}, client: {key: 'client', name: 'Client'},
        taskName: {
            key: 'taskName',
            name: '태스크명',
            renderCell: (row) =>
                <div>{row.row.taskName.endsWith('_null') ? row.row.taskName.slice(0, -5) : row.row.taskName}</div>
        },
        taskType: {key: 'taskType', name: '소재', renderCell: (row) => <div>{row.row.taskType?.toUpperCase()}</div>},
        createdAt: {key: 'createdAt', name: '생성일'},
        endedAt: {key: 'endedAt', name: '완료일'}, dueDate: {key: 'dueDate', name: '납품기한'},
        memo: {
            key: 'memo',
            name: '메모',
            renderCell: row =>
                <div style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{row.row.memo}</div>,
            width: 100
        },
        status: {
            key: 'status',
            name: '상태',
            headerCellClass: 'rdg-header-filter',
            renderHeaderCell: (p) => {
                return <FilterRenderer {...p}>
                    {({filters, ...rest}) => {
                        return <select {...rest} value={filters.status} className={'mx-1'}
                                       onChange={(e) => setFilters({...filters, status: e.target.value})}>
                            <option value={'All'}>전체</option>
                            <option value={'New'}>신규</option>
                            <option value={'Ing'}>🟡진행중</option>
                            <option value={'Done'}>🟢완료</option>
                        </select>
                    }}
                </FilterRenderer>
            },
            renderCell: (row) => <div>{{New: '신규', Ing: '🟡진행중', Done: '🟢완료'}[row.row.status]}</div>,
        },
        buttons: {key: 'buttons', name: '', width: 210, maxWidth: 210, minWidth: 210}
    }

    if (userState.user.userRole === 'client') {
        columns = [
            defaultColumns.no, defaultColumns.pm,
            defaultColumns.taskName, defaultColumns.taskType,
            {...defaultColumns.createdAt, name: '의뢰일'}, defaultColumns.endedAt, defaultColumns.dueDate,
            defaultColumns.memo,
            defaultColumns.status,
            {
                ...defaultColumns.buttons,
                renderCell: (row) => <MDBBtn href={`/${row.row.taskType}/${row.row.extra.hashedId}`}
                                             color={'link'}
                                             disabled={!row.row.taskType || !row.row.extra.work.length}>이동하기</MDBBtn>
            }
        ];
    } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
        const WorkGrid = ({hashedId}) => {
            const work = taskAndWork[hashedId].work
            return work.length ? (<DataGrid className={'rdg-light fill-grid'} style={{width: '50%', height: '100%'}}
                                            rows={work} rowHeight={() => 45} columns={
                [{key: 'workType', name: '작업'}, {key: 'worker', name: '작업자'},
                    {key: 'sourceLanguage', name: '출발어'}, {key: 'targetLanguage', name: '도착어'},
                    {key: 'workEndedAt', name: '완료일'}, {key: 'workDueDate', name: '마감일'},
                    {key: 'workMemo', name: '메모'}, {
                    key: 'workStatus', name: '상태', renderCell: (row) => {
                        return row.row.workEndedAt &&
                            <MDBBtn color={'white'}
                                    disabled={!(taskAndWork[hashedId].task.extra.pmId === userState.user.userId || Object.keys(taskAndWork[hashedId].task.extra.pd).includes(`${userState.user.userId}`))}
                                    onClick={() => setWorkUndoneHashedId(row.row.workHashedId)}>🟢완료</MDBBtn>
                    }
                }]}/>) : null
        }
        columns = [
            {
                key: 'expanded', name: '', width: 40, minWidth: 40, maxWidth: 40, resizable: false,
                colSpan: (args) => args.type === 'ROW' && args.row.type === 'DETAIL' ? columns.length : undefined,
                cellClass: (row) => row.type === 'DETAIL' ? 'rdg-detail-cell' : undefined,
                renderCell: ({row, tabIndex, onRowChange}) => {
                    if (row.type === 'DETAIL') return <WorkGrid hashedId={row.hashedId}/>
                    return taskAndWork[row.extra.hashedId].work.length ?
                        <div><span tabIndex={tabIndex} style={{userSelect: 'none'}}
                                   onClick={() => onRowChange({...row, expanded: !row.expanded})}>
                            {row.expanded ? '\u25BC' : '\u25B6'}</span>
                        </div> : null
                }
            },
            defaultColumns.no, defaultColumns.client, defaultColumns.pm, defaultColumns.pd,
            {key: 'projectCode', name: '프로젝트 코드'}, {key: 'projectName', name: '프로젝트명'}, {key: 'group', name: '그룹'},
            defaultColumns.taskName, defaultColumns.taskType, defaultColumns.createdAt, defaultColumns.endedAt,
            defaultColumns.dueDate, defaultColumns.memo, {
                ...defaultColumns.status, renderCell: (row) => {
                    const authorized = row.row.extra.pmId === userState.user.userId || Object.keys(row.row.extra.pd).includes(`${userState.user.userId}`)
                    return <MDBBtn color={'white'} disabled={!authorized} onClick={() => {
                        row.row.endedAt ? setTaskUndoneHashedId(row.row.extra.hashedId) : setTaskDoneHashedId(row.row.extra.hashedId)
                    }}>{{New: '신규', Ing: '🟡진행중', Done: '🟢완료'}[row.row.status]}</MDBBtn>
                }
            }, {
                ...defaultColumns.buttons,
                renderCell: (row) => row.row.type === 'MASTER' && (row.row.extra.pmId === userState.user.userId || Object.keys(row.row.extra.pd).includes(`${userState.user.userId}`)) ? <>
                    <MDBBtn color={'link'} href={`/${row.row.taskType}/${row.row.extra.hashedId}`}
                            disabled={!row.row.taskType || !taskAndWork[row.row.extra.hashedId]?.work?.length}>이동하기</MDBBtn>
                    <div className={'mx-1'}/>
                    <MDBBtn color={'link'}
                            onClick={() => setModifyTaskHashedId(row.row.extra.hashedId)}>수정하기</MDBBtn>
                </> : null,
            },]
    } else {
        columns = [defaultColumns.no, defaultColumns.client, defaultColumns.pd,
            defaultColumns.taskName, defaultColumns.taskType,
            {key: 'workType', name: '작업', renderCell: (row) => <div>{workType[row.row.workType]}</div>},
            {key: 'sourceLanguage', name: '출발어'}, {key: 'targetLanguage', name: '도착어'},
            defaultColumns.createdAt, defaultColumns.endedAt, {...defaultColumns.dueDate, name: '마감일'},
            defaultColumns.memo, {
                ...defaultColumns.buttons,
                renderCell: (row) => <><MDBBtn color={'link'}
                                               href={`/${row.row.taskType}/${row.row.extra.hashedId}/${row.row.extra.workHashedId}`}
                                               disabled={!row.row.taskType}>이동하기</MDBBtn>
                    <div className={'mx-1'}/>
                    <MDBBtn color={'link'} onClick={() => {
                        console.log(row.row.extra.hashedId)
                    }}>수정하기</MDBBtn>
                </>
            }]
    }

    useEffect(() => {
        setInitialized(false)
        if (userState.user.userRole === 'client') {
            axios.get('v1/task/client', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
                setRows(response.data.map((item, index) => {
                    return {
                        no: index + 1,
                        pm: item.pm_name,
                        taskName: `${item.task_name}_${item.task_episode}`,
                        taskType: fileType(item.task_file_name),
                        createdAt: formatTimestamp(item.task_created_at),
                        endedAt: formatTimestamp(item.task_ended_at),
                        dueDate: formatTimestamp(item.task_due_date),
                        memo: item.task_memo,
                        status: item.task_ended_at ? 'Done' : item.work.length ? 'Ing' : 'New',
                        extra: {hashedId: item.task_hashed_id, work: item.work}
                    }
                }))
            })
        } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
            axios.get('v1/task/pm', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
                setTaskAndWork(groupBy(response.data, (item) => item.task_hashed_id))
            })
        } else {
            axios.get('v1/task/worker', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
                setRows(response.data.map((item, index) => {
                    const pd = JSON.parse(item.pd)
                    return {
                        no: index + 1,
                        client: item.client_name,
                        pd: Object.values(pd).join(','),
                        taskName: `${item.task_name}_${item.task_episode}`,
                        taskType: fileType(item.task_file_name),
                        workType: item.work_type,
                        sourceLanguage: languageCodes[item.work_source_language],
                        targetLanguage: languageCodes[item.work_target_language],
                        createdAt: formatTimestamp(item.work_created_at),
                        endedAt: formatTimestamp(item.work_ended_at),
                        dueDate: formatTimestamp(item.work_due_date),
                        memo: item.work_memo,
                        extra: {hashedId: item.task_hashed_id, workHashedId: item.work_hashed_id, pd: pd}
                    }
                }))
            })
        }
    }, [userState.user.userRole, startAt, endAt, forceRender])

    useEffect(() => {
        if (!taskAndWork) return
        setRows(Object.values(taskAndWork).reduce((result, current, currentIndex) => {
            result.push({...current.task, expanded: true, type: 'MASTER', no: currentIndex + 1})
            current.work.length && result.push({
                type: 'DETAIL', hashedId: current.task.extra.hashedId, status: current.task.status
            })
            return result
        }, []))
    }, [taskAndWork])

    useEffect(() => {
        if (rows) setInitialized(true)
    }, [rows])

    function onRowsChange(rows, {indexes}) {
        const row = rows[indexes[0]];
        if (row.type === 'MASTER') {
            row.expanded ? rows.splice(indexes[0] + 1, 0, {
                type: 'DETAIL', hashedId: row.extra.hashedId, status: row.status
            }) : rows.splice(indexes[0] + 1, 1)
            setRows(rows)
        }
    }

    return initialized && <>
        <FilterContext.Provider value={filters}>
            <DataGrid className={'rdg-light fill-grid'} style={{height: '100%'}} columns={columns} rows={filteredRows}
                      rowHeight={(args) => args.row.type === 'DETAIL' ? 70 + taskAndWork?.[args.row.hashedId].work.length * 45 : 45}
                      onRowsChange={onRowsChange} defaultColumnOptions={{resizable: true}}/>
        </FilterContext.Provider>
        <ModifyModal hashedId={modifyTaskHashedId} setHashedId={setModifyTaskHashedId} forceRenderer={forceRenderer}/>
        <TaskDoneModal hashedId={taskDoneHashedId} setHashedId={setTaskDoneHashedId} forceRenderer={forceRenderer}/>
        <TaskUndoneModal hashedId={taskUndoneHashedId} setHashedId={setTaskUndoneHashedId}
                         forceRenderer={forceRenderer}/>
        <WorkUndoneModal hashedId={workUndoneHashedId} setHashedId={setWorkUndoneHashedId}
                         forceRenderer={forceRenderer}/>
    </>
}

export default TaskGridComponent
