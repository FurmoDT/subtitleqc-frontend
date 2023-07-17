import {useEffect, useState} from 'react';
import axios from "./axios";

const AWSSignedComponent = ({component: Component, ...props}) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const updateIsRendered = () => {setIsRendered(true)}

    useEffect(() => {
        axios.get('v1/aws/cloudfront/signed-cookies').then(() => {
            setIsInitialized(true)
        })
    }, [props.type]);

    useEffect(() => {
        if (isRendered) axios.delete('v1/aws/cloudfront/signed-cookies').then(()=>setIsRendered(false))
    }, [isRendered])


    return isInitialized && <Component updateIsRendered={updateIsRendered}/>;
};

export default AWSSignedComponent;
