import {useEffect} from "react";
import axios from "../../../utils/axios";

const AdminPanel = (props) => {
    useEffect(() => {
        if (!props.userList.length) {
            axios.get(`/v1/user/users`).then((response) => {
                props.setUserList(response.data)
                console.log(response)
            })
        }
        console.log(props.userList)
    }, [props.userList])
    return <div>관리자 대시보드</div>
}

export default AdminPanel
