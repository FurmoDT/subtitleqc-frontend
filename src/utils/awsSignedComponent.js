import {useEffect, useState} from 'react';
import axios from "./axios";

const AWSSignedComponent = ({component: Component}) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        axios.get('v1/aws/cloudfront/signed-cookie', {params: {path: window.location.pathname}}).then(() => {
            setIsInitialized(true)
        })
    }, []);

    return isInitialized && <Component/>;
};

export default AWSSignedComponent;