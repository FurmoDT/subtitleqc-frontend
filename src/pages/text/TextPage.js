import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import DocViewer from "./components/DocViewer";
import {useEffect, useRef, useState} from "react";
import axios from "../../utils/axios";
import {fileExtension} from "../../utils/functions";
import {useNavigate} from "react-router-dom";
import {languageCodes} from "../../utils/config";
import {Sidebar, sidebarClasses} from "react-pro-sidebar";
import ReactDiffViewer from 'react-diff-viewer-continued';
import * as Y from 'yjs'
import {toUint8Array} from "js-base64";
import {Allotment} from "allotment";

const TextPage = () => {
    const [, , taskHashedId, workHashedId] = window.location.pathname.split('/')
    const navigate = useNavigate()
    const containerRef = useRef(null)
    const [textFile, setTextFile] = useState(null)
    const [authority, setAuthority] = useState('')
    const [iceservers, setIceServers] = useState(null)
    const [connectionType, setConnectionType] = useState(navigator.connection.effectiveType)
    const [languageOptions, setLanguageOptions] = useState([])
    const [taskName, setTaskName] = useState('')
    const [targetLanguage, setTargetLanguage] = useState(null)
    const [endedAt, setEndedAt] = useState(null)
    const menuToolbarRef = useRef(null)
    const [showDiff, setShowDiff] = useState(false)
    const [originalText, setOriginalText] = useState('')
    const [reviewText, setReviewText] = useState('')

    useEffect(() => {
        if (showDiff && taskHashedId && targetLanguage.value) {
            axios.get(`v1/task/content`, {
                params: {hashed_id: taskHashedId, room_type: 'original', target_language: targetLanguage.value}
            }).then((response) => {
                const yDoc = new Y.Doc()
                Y.applyUpdate(yDoc, toUint8Array(response.data.task_crdt))
                setOriginalText(yDoc.getText('quill').toString().replace("\uFEFF", ""))
            })
            axios.get(`v1/task/content`, {
                params: {hashed_id: taskHashedId, room_type: 'review', target_language: targetLanguage.value}
            }).then((response) => {
                const yDoc = new Y.Doc()
                Y.applyUpdate(yDoc, toUint8Array(response.data.task_crdt))
                setReviewText(yDoc.getText('quill').toString().replace("\uFEFF", ""))
            })
        }
    }, [showDiff, taskHashedId, targetLanguage])

    useEffect(() => {
        if (!taskHashedId) {
            setAuthority('test')
            setTextFile('https://subtitleqc.s3.ap-northeast-2.amazonaws.com/sample.pdf')
            setLanguageOptions([{value: '', label: ''}])
            return
        }
        axios.get(`v1/task/access`, {
            params: {hashed_id: taskHashedId, work_hashed_id: workHashedId}
        }).then((response) => {
            setAuthority(response.data.authority)
            const task = response.data.task
            setTextFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_info?.name)}`)
            setLanguageOptions(response.data.target_languages.map(v => ({value: v, label: languageCodes[v]})))
            setTaskName(`${task.task_name}_${task.task_episode}`)
            setEndedAt(task.task_ended_at || response.data.ended_at)
        }).catch(() => navigate('/error'))
    }, [taskHashedId, workHashedId, navigate])

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
        if (/^(test|pm|pd|qc|client)$/.test(authority)) {
            return <Allotment>
                <QuillEditor editorType={'original'} taskHashedId={taskHashedId} targetLanguage={targetLanguage}
                             iceservers={iceservers} connectionType={connectionType}
                             disabled={authority !== 'test'}
                             onSave={menuToolbarRef.current.showSavingStatus}/>
                <QuillEditor editorType={'review'} taskHashedId={taskHashedId} targetLanguage={targetLanguage}
                             iceservers={iceservers} connectionType={connectionType}
                             disabled={authority === 'client' || endedAt}
                             onSave={menuToolbarRef.current.showSavingStatus}/>
            </Allotment>
        } else {
            return <QuillEditor editorType={'original'} taskHashedId={taskHashedId} targetLanguage={targetLanguage}
                                iceservers={iceservers} connectionType={connectionType}
                                disabled={endedAt}
                                onSave={menuToolbarRef.current.showSavingStatus}/>
        }
    }

    return <div style={{width: '100vw', height: 'calc(100vh - 50px)'}}>
        {authority &&
            <MenuToolbar ref={menuToolbarRef} languageOptions={languageOptions} taskWorkId={workHashedId}
                         targetLanguage={targetLanguage} setTargetLanguage={setTargetLanguage} taskName={taskName}
                         authority={authority} showDiff={showDiff} setShowDiff={setShowDiff}/>}
        <div ref={containerRef} className={'w-100 position-relative'} style={{height: 'calc(100% - 40px)'}}>
            {textFile && iceservers && targetLanguage &&
                <Allotment vertical={true}>
                    <>
                        <Allotment>
                            <Allotment.Pane preferredSize={'35%'}><DocViewer textFile={textFile}/></Allotment.Pane>
                            <EditorComponent/>
                        </Allotment>
                        <Sidebar width={'50vw'} collapsedWidth={'0px'} collapsed={!showDiff} rootStyles={{
                            [`.${sidebarClasses.container}`]: {width: '100%', height: '100%'}
                        }}>
                            <ReactDiffViewer oldValue={originalText} newValue={reviewText} splitView={true}
                                             hideLineNumbers={true} leftTitle={'Original'} rightTitle={'Review'}
                                             styles={{
                                                 diffRemoved: {backgroundColor: '#FFCCCC'},
                                                 diffAdded: {backgroundColor: 'lightgreen'},
                                                 wordRemoved: {backgroundColor: 'lightcoral'},
                                                 wordAdded: {backgroundColor: '#00CC00'}
                                             }}
                            />
                        </Sidebar>
                    </>
                    <Allotment.Pane preferredSize={'200px'}>
                        <>
                        </>
                    </Allotment.Pane>
                </Allotment>
            }
        </div>
    </div>
};

export default TextPage
