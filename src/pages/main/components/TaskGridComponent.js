import {createContext, useContext, useEffect, useMemo, useState} from "react";
import DataGrid from "react-data-grid";
import axios from "../../../utils/axios";
import {convertToTimestamp, fileType, formatTimestamp} from "../../../utils/functions";
import {MDBBtn, MDBIcon, MDBTooltip} from "mdb-react-ui-kit";
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
            if (!result.has(key)) {
                result.set(key, {
                    task: {
                        client: current.client_name,
                        pm: current.pm_name,
                        pd: Object.values(pd).join(','),
                        projectCode: current.project_code,
                        projectName: current.project_name,
                        group: current.task_group_key,
                        taskName: `${current.task_name}_${current.task_episode}`,
                        taskType: fileType(current.task_file_info?.name),
                        createdAt: formatTimestamp(current.task_created_at),
                        endedAt: formatTimestamp(current.task_ended_at),
                        dueDate: formatTimestamp(current.task_due_date),
                        memo: current.task_memo,
                        status: current.task_ended_at ? 'Done' : null,
                        extra: {hashedId: current.task_hashed_id, pmId: current.pm_id, pd: pd},
                    }, work: []
                })
            }
            if (current.work_id && !current.work_deactivated) result.get(key).work.push({
                workHashedId: current.work_hashed_id,
                workType: workType[current.work_type],
                workerName: current.worker_name,
                workerEmail: current.worker_email,
                sourceLanguage: languageCodes[current.work_source_language],
                targetLanguage: languageCodes[current.work_target_language],
                workCreatedAt: formatTimestamp(current.work_created_at),
                workEndedAt: formatTimestamp(current.work_ended_at),
                workDueDate: formatTimestamp(current.work_due_date),
                workMemo: current.work_memo
            });
            return result;
        }, new Map());
    }

    const defaultColumns = {
        no: {key: 'no', name: '번호', width: 60},
        pm: {key: 'pm', name: '담당자(외부)'}, pd: {key: 'pd', name: '담당자(내부)'}, client: {key: 'client', name: '거래처'},
        taskName: {key: 'taskName', name: '태스크명'},
        taskType: {key: 'taskType', name: '소재', renderCell: (row) => <div>{row.row.taskType?.toUpperCase()}</div>},
        createdAt: {key: 'createdAt', name: '생성일'},
        endedAt: {key: 'endedAt', name: '완료일'}, dueDate: {key: 'dueDate', name: '납품기한'},
        memo: {
            key: 'memo',
            name: '메모',
            renderCell: row => <div className={'text-truncate'}>{row.row.memo}</div>,
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
            const task = taskAndWork.get(hashedId).task
            const work = taskAndWork.get(hashedId).work
            return work.length ? (<DataGrid className={'rdg-light fill-grid rounded w-100 h-100 border-main ms-3'}
                                            rows={work} rowHeight={() => 35} columns={[
                {
                    key: 'workType',
                    name: '작업',
                    renderCell: row =>
                        <a className={task.taskType && (task.extra.pmId === userState.user.userId || Object.keys(task.extra.pd).includes(`${userState.user.userId}`)) ? '' : 'custom-disabled'}
                           color={'link'} style={{fontSize: '0.875rem'}}
                           href={`/${task.taskType}/${hashedId}/${row.row.workHashedId}`}>{row.row.workType}</a>
                },
                {
                    key: 'worker', name: '작업자', renderCell: row => <MDBTooltip tag={'div'} title={row.row.workerEmail}>
                        {row.row.workerName}
                    </MDBTooltip>
                },
                {key: 'sourceLanguage', name: '출발어'}, {key: 'targetLanguage', name: '도착어'},
                {key: 'workCreatedAt', name: '시작일'}, {
                    key: 'workDueDate',
                    name: '완료예정일',
                    renderCell: row => {
                        const bg = convertToTimestamp(row.row.workDueDate) >= new Date() ? '' : 'bg-red'
                        return <div className={bg}>{row.row.workDueDate}</div>
                    }
                }, // {key: 'workMemo', name: '메모'},
                {
                    key: 'workStatus', name: '상태', renderCell: (row) => {
                        return row.row.workEndedAt ?
                            <MDBBtn outline
                                    className={`${(taskAndWork.get(hashedId).task.extra.pmId === userState.user.userId || Object.keys(taskAndWork.get(hashedId).task.extra.pd).includes(`${userState.user.userId}`)) ? 'button-active' : 'button-disabled'}`}
                                    onClick={() => setWorkUndoneHashedId(row.row.workHashedId)}>🟢완료</MDBBtn> :
                            <MDBBtn outline className={'button-disabled'}>🟡진행중</MDBBtn>
                    }
                }]}/>) : null
        }
        columns = [
            {
                key: 'expanded', name: '', width: 30, minWidth: 30, maxWidth: 30, resizable: false,
                colSpan: (args) => args.type === 'ROW' && args.row.type === 'DETAIL' ? columns.length : undefined,
                cellClass: (row) => row.type === 'DETAIL' ? 'rdg-detail-cell' : undefined,
                renderCell: ({row, tabIndex, onRowChange}) => {
                    if (row.type === 'DETAIL') return <WorkGrid hashedId={row.hashedId}/>
                    return taskAndWork.get(row.extra.hashedId).work.length ?
                        <div><span className={'user-select-none'} tabIndex={tabIndex}
                                   onClick={() => onRowChange({...row, expanded: !row.expanded})}>
                            {row.expanded ? '\u25BC' : '\u25B6'}</span>
                        </div> : null
                }
            },
            defaultColumns.no, {key: 'projectCode', name: '프로젝트 코드'}, defaultColumns.client,
            {key: 'projectName', name: '프로젝트명'}, defaultColumns.pm, defaultColumns.pd,
            {
                ...defaultColumns.taskName,
                renderCell: (row) => {
                    if (row.row.type !== 'MASTER') return
                    const authorized = row.row.extra.pmId === userState.user.userId || Object.keys(row.row.extra.pd).includes(`${userState.user.userId}`)
                    return <>
                        <a className={authorized ? '' : 'custom-disabled'} color={'link'} style={{fontSize: '0.875rem'}}
                           href={`/${row.row.taskType}/${row.row.extra.hashedId}`}>{row.row.taskName.endsWith('_null') ? row.row.taskName.slice(0, -5) : row.row.taskName}</a>
                        {authorized && <MDBBtn className={'bg-main mx-1'} color={'link'} size={'sm'} floating
                                               onClick={() => setModifyTaskHashedId(row.row.extra.hashedId)}>
                            <MDBIcon fas icon="cog"/></MDBBtn>}
                    </>
                }
            }, defaultColumns.taskType, defaultColumns.createdAt, defaultColumns.dueDate, {
                ...defaultColumns.status, renderCell: (row) => {
                    const authorized = row.row.extra.pmId === userState.user.userId || Object.keys(row.row.extra.pd).includes(`${userState.user.userId}`)
                    return <>
                        <MDBBtn outline className={`${authorized ? 'button-active' : 'button-disabled'}`}
                                onClick={() => row.row.endedAt ? setTaskUndoneHashedId(row.row.extra.hashedId) : setTaskDoneHashedId(row.row.extra.hashedId)}>
                            {{New: '신규', Ing: '🟡진행중', Done: '🟢완료'}[row.row.status]}</MDBBtn>
                    </>
                }
            }]
    } else {
        columns = [defaultColumns.no, defaultColumns.client, defaultColumns.pd,
            {
                ...defaultColumns.taskName,
                renderCell: (row) =>
                    <a className={row.row.taskType ? '' : 'custom-disabled'}
                       color={'link'} style={{fontSize: '0.875rem'}}
                       href={`/${row.row.taskType}/${row.row.extra.hashedId}/${row.row.extra.workHashedId}`}>{row.row.taskName.endsWith('_null') ? row.row.taskName.slice(0, -5) : row.row.taskName}</a>
            }, defaultColumns.taskType,
            {key: 'workType', name: '작업', renderCell: (row) => <div>{workType[row.row.workType]}</div>},
            {key: 'sourceLanguage', name: '출발어'}, {key: 'targetLanguage', name: '도착어'},
            defaultColumns.createdAt, defaultColumns.endedAt, {...defaultColumns.dueDate, name: '마감일'},
            defaultColumns.memo]
    }

    useEffect(() => {
        if (!startAt || !endAt) return
        setInitialized(false)
        if (userState.user.userRole === 'client') {
            axios.get('v1/tasks/client', {params: {start_date: startAt, end_date: endAt}}).then((response) =>
                setRows(response.data.map((item, index) => ({
                    no: index + 1,
                    pm: item.pm_name,
                    taskName: `${item.task_name}_${item.task_episode}`,
                    taskType: fileType(item.task_file_info?.name),
                    createdAt: formatTimestamp(item.task_created_at),
                    endedAt: formatTimestamp(item.task_ended_at),
                    dueDate: formatTimestamp(item.task_due_date),
                    memo: item.task_memo,
                    status: item.task_ended_at ? 'Done' : item.work.length ? 'Ing' : 'New',
                    extra: {hashedId: item.task_hashed_id, work: item.work}
                }))))
        } else if (/^(admin|pm)$/.test(userState.user.userRole)) {
            axios.get('v1/tasks/pm', {params: {start_date: startAt, end_date: endAt}}).then((response) =>
                setTaskAndWork(groupBy(response.data, (item) => item.task_hashed_id))
            )
        } else {
            axios.get('v1/tasks/worker', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
                setRows(response.data.map((item, index) => {
                    const pd = JSON.parse(item.pd)
                    return {
                        no: index + 1,
                        client: item.client_name,
                        pd: Object.values(pd).join(','),
                        taskName: `${item.task_name}_${item.task_episode}`,
                        taskType: fileType(item.task_file_info?.name),
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
        setRows(Array.from(taskAndWork.values()).sort((a, b) => a.work.length === 0 ? -1 : b.work.length === 0 ? 1 : 0).reduce((result, current, currentIndex) => {
            current.task.status = current.task.status || (current.work.length ? 'Ing' : 'New')
            result.push({...current.task, expanded: true, type: 'MASTER', no: currentIndex + 1})
            current.work.length && result.push({type: 'DETAIL', hashedId: current.task.extra.hashedId})
            return result
        }, []))
    }, [taskAndWork])

    useEffect(() => {
        if (rows) setInitialized(true)
    }, [rows])

    function onRowsChange(rows, {indexes}) {
        const row = rows[indexes[0]];
        if (row.type === 'MASTER') {
            if (row.expanded) rows.splice(indexes[0] + 1, 0, {type: 'DETAIL', hashedId: row.extra.hashedId})
            else rows.splice(indexes[0] + 1, 1)
            setRows(rows)
        }
    }

    return initialized && <>
        <FilterContext.Provider value={filters}>
            <DataGrid className={'rdg-light fill-grid rounded h-100 border-main'} columns={columns} rows={filteredRows}
                      rowHeight={(args) => args.row.type === 'DETAIL' ? 70 + taskAndWork?.get(args.row.hashedId).work.length * 35 : 35}
                      onRowsChange={onRowsChange} defaultColumnOptions={{resizable: true}}/>
        </FilterContext.Provider>
        <ModifyModal hashedId={modifyTaskHashedId} setHashedId={setModifyTaskHashedId} forceRenderer={forceRenderer}/>
        <TaskDoneModal hashedId={taskDoneHashedId} setHashedId={setTaskDoneHashedId} forceRenderer={forceRenderer}/>
        <TaskUndoneModal hashedId={taskUndoneHashedId} setHashedId={setTaskUndoneHashedId}
                         forceRenderer={forceRenderer}/>
        <WorkUndoneModal workHashedId={workUndoneHashedId} setWorkHashedId={setWorkUndoneHashedId}
                         forceRenderer={forceRenderer}/>
    </>
}

export default TaskGridComponent
