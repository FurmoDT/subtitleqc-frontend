import {useEffect} from "react";
import axios from "../../../utils/axios";

const AdminPanel = ({userList, setUserList}) => {
    useEffect(() => {
        if (!userList.length) {
            axios.get(`/v1/user/users`).then((response) => {
                setUserList(response.data)
                console.log(response)
            })
        }
        console.log(userList)
    }, [userList])
    return <div>관리자 대시보드</div>
}

export default AdminPanel
