import {useCallback, useContext, useLayoutEffect, useRef, useState} from "react";
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from "../../../utils/axios";
import {AuthContext} from "../../../utils/authContext";

const AdminPanel = ({userListRef}) => {
    const gridRef = useRef(null)
    const [rowData, setRowData] = useState([]);
    const {userState} = useContext(AuthContext)
    useLayoutEffect(() => {
        setRowData(userListRef.current.map(v => {
            return {
                id: v.user_id,
                code: v.user_info.code,
                name: v.user_name,
                email: v.user_email,
                birthday: v.user_birthday,
                phone: v.user_phone,
                role: v.user_role,
                address: v.user_info.address,
                skill: v.user_info.skill,
                tag: v.user_info.tag,
                note: v.user_info.note
            }
        }))
    }, [userListRef])
    const updateUser = useCallback((userId, key, value) => {
        const user = {user_id: userId}
        if (['name', 'birthday', 'phone', 'role'].includes(key)) user[`user_${key}`] = value
        else user.user_info = [{[key]: value}]
        axios.post('/v1/user/', {user: user}).then()
    }, [])

    const [columnDefs] = useState([
        {field: 'id', editable: false, sort: 'asc'},
        {
            field: 'role',
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: {values: ['admin', 'pm', 'worker', 'client']},
            editable: userState.user?.userRole === 'admin'
        },
        {field: 'code', headerComponent: () => <div className={'custom-header'}><span>거래처코드</span></div>},
        {field: 'name', headerComponent: () => <div className={'custom-header'}><span>이름</span></div>},
        {
            field: 'email',
            headerComponent: () => <div className={'custom-header'}><span>이메일</span></div>,
            editable: false
        },
        {field: 'birthday', headerComponent: () => <div className={'custom-header'}><span>생년월일</span></div>},
        {field: 'phone', headerComponent: () => <div className={'custom-header'}><span>휴대폰번호</span></div>},
        {field: 'address', headerComponent: () => <div className={'custom-header'}><span>주소</span></div>},
        {field: 'skill', headerComponent: () => <div className={'custom-header'}><span>스킬셋</span></div>},
        {field: 'tag', headerComponent: () => <div className={'custom-header'}><span>태그</span></div>},
        {field: 'note', headerComponent: () => <div className={'custom-header'}><span>비고</span></div>},
    ])
    return <div className="ag-theme-alpine" style={{height: 'calc(100% - 100px)'}}>
        <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{editable: true, sortable: true, resizable: true}}
            onFirstDataRendered={() => {
                const allColumnIds = [];
                gridRef.current.columnApi.getColumns().forEach((column) => {
                    allColumnIds.push(column.getId());
                });
                gridRef.current.columnApi.autoSizeColumns(allColumnIds, false);
            }}
            undoRedoCellEditing={true}
            onCellValueChanged={(event) => updateUser(event.data.id, event.colDef.field, event.newValue)}
        >
        </AgGridReact>
    </div>
}

export default AdminPanel
