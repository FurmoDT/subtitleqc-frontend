import {useCallback, useLayoutEffect, useRef, useState} from "react";
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from "../../../utils/axios";

const AdminPanel = ({userInfoRef, userListRef}) => {
    const gridRef = useRef(null)
    const [rowData, setRowData] = useState([]);

    const CustomHeader = (name) => {
        return <div className={'custom-header'}><span>{name}</span></div>
    }

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
        axios.post('v1/users', {user: user}).then()
    }, [])

    const [columnDefs] = useState([{field: 'id', editable: false, sort: 'asc'}, {
        field: 'role',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {values: ['admin', 'pm', 'worker', 'client']},
        editable: userInfoRef.current?.user_role === 'admin',
        headerComponent: () => CustomHeader('권한')
    }, {
        field: 'code', headerComponent: () => CustomHeader('거래처코드')
    }, {
        field: 'name', headerComponent: () => CustomHeader('이름')
    }, {
        field: 'email', headerComponent: () => CustomHeader('이메일'), editable: false
    }, {
        field: 'birthday', headerComponent: () => CustomHeader('생년월일')
    }, {
        field: 'phone', headerComponent: () => CustomHeader('휴대폰번호')
    }, {
        field: 'address', headerComponent: () => CustomHeader('주소')
    }, {
        field: 'skill', headerComponent: () => CustomHeader('스킬셋')
    }, {
        field: 'tag', headerComponent: () => CustomHeader('태그')
    }, {
        field: 'note', headerComponent: () => CustomHeader('비고')
    }])
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
