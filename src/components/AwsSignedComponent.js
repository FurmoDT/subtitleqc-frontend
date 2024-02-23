import {useEffect, useState} from 'react';
import axios from "../utils/axios";

const AwsSignedComponent = ({component: Component, ...props}) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        axios.get('v1/aws/cloudfront/signed-cookies', {withCredentials: true}).then(() => setIsInitialized(true))
    }, [props.type]);

    return isInitialized && <Component/>;
};

export default AwsSignedComponent;
