import DataGrid from "react-data-grid";
import {useEffect, useState} from "react";
import axios from "../../../utils/axios";
import {formatTimestamp} from "../../../utils/functions";
import {MDBBtn} from "mdb-react-ui-kit";
import ModifyModal from "./dialogs/project/ModifyModal";

const ProjectGridComponent = ({startAt, endAt}) => {
    const columns = [
        {key: 'no', name: 'No', width: 60}, {key: 'projectCode', name: '프로젝트코드'}, {key: 'client', name: 'Client'},
        {key: 'projectName', name: '프로젝트명'}, {key: 'sep', name: '구분'}, {key: 'pm', name: 'PM'},
        {key: 'createdAt', name: '생성일'},
        {
            key: 'buttons', name: '', width: 110, maxWidth: 110, minWidth: 110,
            renderCell: (row) => <MDBBtn color={'link'} onClick={()=>setModifyProjectId(row.row.extra.projectId)}>수정하기</MDBBtn>
        }]
    const [rows, setRows] = useState([])
    const [modifyProjectId, setModifyProjectId] = useState(null)

    useEffect(() => {
        if (!startAt || !endAt) return
        axios.get('v1/project/projects', {params: {start_date: startAt, end_date: endAt}}).then((response) => {
            setRows(response.data.map((item, index) => ({
                no: index + 1,
                projectCode: item.project_code,
                client: item.client_name,
                projectName: item.project_name,
                // pm:
                createdAt: formatTimestamp(item.project_created_at),
                extra: {projectId: item.project_id}
            })))
        })
    }, [startAt, endAt])

    return <>
        <DataGrid className={'rdg-light fill-grid'} style={{height: '100%'}} columns={columns} rows={rows}
                     rowHeight={() => 45} defaultColumnOptions={{resizable: true}}/>
        <ModifyModal projectId={modifyProjectId} setProjectId={setModifyProjectId}/>
    </>
}

export default ProjectGridComponent
