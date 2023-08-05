import {useEffect, useState} from 'react';
import axios from "./axios";

const AWSSignedComponent = ({component: Component, ...props}) => {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        axios.get('v1/aws/cloudfront/signed-cookies').then(() => setIsInitialized(true))
    }, [props.type]);

    return isInitialized && <Component/>;
};

export default AWSSignedComponent;
