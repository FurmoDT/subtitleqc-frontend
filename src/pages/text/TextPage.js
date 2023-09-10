import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import DocViewer from "./components/DocViewer";
import {useEffect, useRef, useState} from "react";
import axios from "../../utils/axios";
import {fileExtension} from "../../utils/functions";
import {useNavigate} from "react-router-dom";
import {Split} from "@geoffcox/react-splitter";
import {languageCodes} from "../../utils/config";
import {Sidebar, sidebarClasses} from "react-pro-sidebar";

const TextPage = () => {
    const [, , taskHashedId, taskWorkId] = window.location.pathname.split('/')
    const navigate = useNavigate()
    const [textFile, setTextFile] = useState(null)
    const [authority, setAuthority] = useState(null)
    const [iceservers, setIceServers] = useState(null)
    const [connectionType, setConnectionType] = useState(navigator.connection.effectiveType)
    const [languageOptions, setLanguageOptions] = useState([])
    const [targetLanguage, setTargetLanguage] = useState(null)
    const menuToolbarRef = useRef(null)
    const [showDiff, setShowDiff] = useState(false)

    useEffect(() => {
        if (!taskHashedId) {
            setAuthority('test')
            setTextFile('https://subtitleqc.s3.ap-northeast-2.amazonaws.com/sample.pdf')
            setLanguageOptions([{value: '', label: ''}])
            return
        }
        axios.get(`v1/project/task/access`, {
            params: {hashed_id: taskHashedId, work_hashed_id: taskWorkId}
        }).then((response) => {
            setAuthority(response.data.authority)
            const task = response.data.task
            setTextFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_name)}`)
            setLanguageOptions(response.data.target_languages.map(v => ({value: v, label: languageCodes[v]})))
        }).catch(() => navigate('/error'))
    }, [taskHashedId, taskWorkId, navigate])

    useEffect(() => {
        setTargetLanguage(languageOptions[0])
    }, [languageOptions])

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
                <QuillEditor editorType={'original'} taskHashedId={taskHashedId} targetLanguage={targetLanguage}
                             iceservers={iceservers} connectionType={connectionType}
                             disabled={!['test'].includes(authority)}
                             onSave={menuToolbarRef.current.showSavingStatus}/>
                <QuillEditor editorType={'review'} taskHashedId={taskHashedId} targetLanguage={targetLanguage}
                             iceservers={iceservers} connectionType={connectionType}
                             disabled={['client'].includes(authority)}
                             onSave={menuToolbarRef.current.showSavingStatus}/>
            </Split>
        } else {
            return <QuillEditor editorType={'original'} taskHashedId={taskHashedId} targetLanguage={targetLanguage}
                                iceservers={iceservers} connectionType={connectionType}
                                disabled={false}
                                onSave={menuToolbarRef.current.showSavingStatus}/>
        }
    }

    return <div style={{width: '100vw', height: 'calc(100vh - 50px)'}}>
        <MenuToolbar ref={menuToolbarRef} languageOptions={languageOptions} taskWorkId={taskWorkId}
                     targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage}
                     showDiff={showDiff} setShowDiff={setShowDiff}/>
        <div style={{width: '100%', height: 'calc(100% - 40px)', position: 'relative'}}>
            <Split horizontal={true} initialPrimarySize={'75%'} splitterSize={'5px'}>
                {textFile && iceservers && targetLanguage &&
                    <div style={{width: '100%', height: '100%', display: 'flex'}}>
                        <Split initialPrimarySize={'40%'} splitterSize={'5px'}>
                            <DocViewer textFile={textFile}/>
                            <EditorComponent/></Split>
                        <Sidebar width={'50vw'} collapsedWidth={'0px'} collapsed={!showDiff} rootStyles={{
                            [`.${sidebarClasses.container}`]: {
                                width: '100%', height: '100%'
                            }
                        }}>
                            <div>diff view</div>
                        </Sidebar>
                    </div>
                }

            </Split>
        </div>
    </div>
};

export default TextPage
