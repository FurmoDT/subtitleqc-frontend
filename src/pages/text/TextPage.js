import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import DocViewer from "./components/DocViewer";
import {useContext, useEffect, useRef, useState} from "react";
import axios from "../../utils/axios";
import {fileExtension} from "../../utils/functions";
import {useNavigate} from "react-router-dom";
import {WebsocketContext} from "../../contexts/websocketContext";
import {Split} from "@geoffcox/react-splitter";

const TextPage = () => {
    const pathname = window.location.pathname
    const navigate = useNavigate()
    const [textFile, setTextFile] = useState(null)
    const [authority, setAuthority] = useState(null)
    const [iceservers, setIceServers] = useState(null)
    const {isOnline} = useContext(WebsocketContext)
    const [connectionType, setConnectionType] = useState(navigator.connection.effectiveType)
    const menuToolbarRef = useRef(null)

    useEffect(() => {
        if (!pathname.split('/')[2]) {
            setAuthority('test')
            setTextFile('https://subtitleqc.s3.ap-northeast-2.amazonaws.com/sample.pdf')
            return
        }
        axios.get(`v1/project/task/access`, {
            params: {
                hashed_id: pathname.split('/')[2], work_hashed_id: pathname.split('/')[3]
            }
        }).then((response) => {
            setAuthority(response.data.authority)
            const task = response.data.task
            setTextFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_name)}`)
        }).catch(() => navigate('/error'))
    }, [pathname, navigate])

    useEffect(() => {
        axios.get(`v1/twilio/iceservers`).then((response) => {
            setIceServers(response.data)
        })
    }, [])

    useEffect(() => {
        const connection = navigator.connection
        const handleConnectionChange = () => setConnectionType(connection.effectiveType)

        navigator.connection.addEventListener('change', handleConnectionChange)

        return () => {
            navigator.connection.removeEventListener('change', handleConnectionChange)
        }
    }, [])

    const EditorComponent = () => {
        if (['test', 'pm', 'pd', 'qc', 'client'].includes(authority)) {
            return <Split horizontal={false} initialPrimarySize={'50%'} splitterSize={'5px'}>
                <QuillEditor editorType={'original'} iceservers={iceservers} isOnline={isOnline}
                             connectionType={connectionType} disabled={!['test'].includes(authority)}
                             onSave={menuToolbarRef.current.showSavingStatus}/>
                <QuillEditor editorType={'review'} iceservers={iceservers} isOnline={isOnline}
                             connectionType={connectionType} disabled={['client'].includes(authority)}
                             onSave={menuToolbarRef.current.showSavingStatus}/>
            </Split>
        } else return <QuillEditor editorType={'original'} iceservers={iceservers} isOnline={isOnline}
                                   connectionType={connectionType} disabled={false}
                                   onSave={menuToolbarRef.current.showSavingStatus}/>
    }

    return <div style={{width: '100vw', height: 'calc(100vh - 50px)'}}>
        <MenuToolbar ref={menuToolbarRef}/>
        <div style={{width: '100%', height: 'calc(100% - 40px)', position: 'relative'}}>
            <Split horizontal={true} initialPrimarySize={'75%'} splitterSize={'5px'}>
                {textFile && iceservers && <Split initialPrimarySize={'40%'} splitterSize={'5px'}>
                    <DocViewer textFile={textFile}/>
                    <EditorComponent/>
                </Split>}
            </Split>
        </div>
    </div>
};

export default TextPage