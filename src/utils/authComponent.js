import {useEffect, useState} from 'react';
import axios from "./axios";

const AuthComponent = ({component: Component}) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        axios.get('/v1/auth/get_current_user').then((response) => {
            setIsInitialized(true)
        });
    }, []);

    return isInitialized && <Component/>;
};

export default AuthComponent;