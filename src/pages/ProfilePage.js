import {useContext, useEffect} from "react";
import axios from "../utils/axios";
import {AuthContext} from "../utils/authContext";

const ProfilePage = () => {
    const {userState} = useContext(AuthContext)
    useEffect(() => {
        if (userState.isAuthenticated) {
            axios.get(`/v1/user/profile`).then((response) => {
                console.log(response)
            })
        }
    }, [userState])
    return <div style={{height: 'calc(100vh - 60px)', display: 'flex', justifyContent: 'center'}}>
        Profile
    </div>
};

export default ProfilePage
