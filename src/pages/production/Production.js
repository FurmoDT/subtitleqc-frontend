import InformationWindow from "./components/InformationWindow";
import LanguageWindow from "./components/LanguageWindow";
import MediaWindow from "./components/MediaWindow";
import MenuToolbar from "./components/MenuToolbar";
import TimelineWindow from "./components/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import TransToolbar from "./components/TransToolbar";
import {defaultLanguage, defaultProjectDetail, defaultSubtitle, languageCodes} from "../../utils/config";
import FileUploadModal from "./components/dialogs/FileUploadModal";
import Dropzone from "./components/Dropzone";
import {createSegment, fileExtension, tcToSec} from "../../utils/functions";
import {v4} from "uuid";
import axios from "../../utils/axios";
import {useNavigate} from "react-router-dom";
import {Allotment} from "allotment";
import CrdtHandler from "./components/CrdtHandler";
import * as Y from "yjs";
import './Production.css'

const Production = () => {
    const [, , taskHashedId, workHashedId] = window.location.pathname.split('/')
    const [authority, setAuthority] = useState('')
    const [taskName, setTaskName] = useState('')
    const [taskEndedAt, setTaskEndedAt] = useState(undefined)
    const [workEndedAt, setWorkEndedAt] = useState(undefined)
    const navigate = useNavigate()
    const dropzoneRef = useRef(null)
    const [fileUploadModalShow, setFileUploadModalShow] = useState(false)
    const containerRef = useRef(null)
    const languageWindowRef = useRef(null)
    const timelineWindowRef = useRef(null)
    const [languageWindowSize, setLanguageWindowSize] = useState({width: 0, height: 0})
    const [timelineWindowSize, setTimelineWindowSize] = useState({height: 320})
    const resizingTimeoutRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaInfo, setMediaInfo] = useState(null)
    const [video, setVideo] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const [projectDetail, setProjectDetail] = useState(defaultProjectDetail())
    const focusedRef = useRef(null)
    const playerRef = useRef(null)
    const waveformRef = useRef(null)
    const cellDataRef = useRef(defaultSubtitle())
    const [languages, setLanguages] = useState(defaultLanguage())
    const hotRef = useRef(null)
    const hotSelectionRef = useRef({rowStart: null, columnStart: null, rowEnd: null, columnEnd: null})
    const [hotFontSize, setHotFontSize] = useState('14px')
    const tcOffsetButtonRef = useRef(null)
    const tcIoButtonRef = useRef(null)
    const tcInButtonRef = useRef(null)
    const tcOutButtonRef = useRef(null)
    const tcIncreaseButtonRef = useRef(null)
    const tcDecreaseButtonRef = useRef(null)
    const insertLineAboveButtonRef = useRef(null)
    const insertLineBelowButtonRef = useRef(null)
    const removeLineButtonRef = useRef(null)
    const splitLineButtonRef = useRef(null)
    const mergeLineButtonRef = useRef(null)
    const findButtonRef = useRef(null)
    const replaceButtonRef = useRef(null)
    const selectedSegment = useRef(null)
    const [tcLock, setTcLock] = useState(true)
    const tcLockRef = useRef(true)
    const [subtitleIndex, setSubtitleIndex] = useState(-1)
    const menuToolbarRef = useRef(null)
    const crdtHandlerRef = useRef(null)
    const [workTypeKey, setWorkTypeKey] = useState(false)
    const [readOnly, setReadOnly] = useState(false)
    const [crdtMode, setCrdtMode] = useState(false)
    const [crdtInitialized, setCrdtInitialized] = useState(false)
    const [crdtAwarenessInitialized, setCrdtAwarenessInitialized] = useState(false)
    const [dataInitialized, setDataInitialized] = useState(false)

    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const timeOut = setTimeout(() => {
                hotRef.current.removeHook('afterRender', afterRenderCallback)
                resolve()
            }, 100)
            const afterRenderCallback = (isForced) => {
                clearTimeout(timeOut)
                if (!isForced) {
                    resolve()
                }
            }
            hotRef.current?.addHookOnce('afterRender', afterRenderCallback)
        })
    }, [])
    const resetSegments = useCallback(() => {
        const segments = []
        cellDataRef.current.forEach((value) => {
            const [start, end] = [tcToSec(value.start), tcToSec(value.end)]
            if (0 <= start && start <= end) segments.push(createSegment(start, end, value.rowId))
        })
        selectedSegment.current = null
        return segments
    }, [])

    useEffect(() => {
        const handleLanguageWindowResize = () => {
            clearTimeout(resizingTimeoutRef.current);
            resizingTimeoutRef.current = setTimeout(() => {
                setLanguageWindowSize({
                    width: languageWindowRef.current.offsetWidth, height: languageWindowRef.current.offsetHeight - 40
                })
            }, 200)
        };
        const observer = new ResizeObserver(() => {
            containerRef.current.resize([dropzoneRef.current.offsetHeight - timelineWindowRef.current.childNodes[1].offsetHeight, timelineWindowRef.current.childNodes[1].offsetHeight])
            handleLanguageWindowResize()
            setTimelineWindowSize(prevState => ({height: prevState.height}))
        });
        observer.observe(dropzoneRef.current);
        return () => observer.disconnect()
    }, []);

    useEffect(() => {
        if (!taskHashedId && dataInitialized) localStorage.setItem('language', JSON.stringify(languages))
    }, [taskHashedId, languages, dataInitialized])

    useEffect(() => {
        tcLockRef.current = tcLock
        if (selectedSegment.current) {
            selectedSegment.current.update({color: 'white', editable: false})
            selectedSegment.current = null
        }
    }, [tcLock])

    useEffect(() => {
        if (languageFile) {
            if (languageFile.projectDetail) { // fspx
                cellDataRef.current = languageFile.subtitle.map(v => ({...v, rowId: v.rowId || v4()}))
                localStorage.setItem('subtitle', JSON.stringify(cellDataRef.current))
                setLanguages(languageFile.language)
                setProjectDetail(languageFile.projectDetail)
                if (waveformRef.current) {
                    waveformRef.current.segments.removeAll()
                    waveformRef.current.segments.add(resetSegments())
                }
            } else setFileUploadModalShow(true)
        }
    }, [languageFile, resetSegments])

    useEffect(() => {
        if (!taskHashedId) {
            setAuthority('local')
            if (localStorage.language) setLanguages(JSON.parse(localStorage.language))
            if (localStorage.subtitle) cellDataRef.current = JSON.parse(localStorage.subtitle)
            if (localStorage.projectDetail) setProjectDetail(JSON.parse(localStorage.projectDetail))
            setDataInitialized(true)
            return
        }
        axios.get(`v1/tasks/access/${taskHashedId}`, {params: {work_hashed_id: workHashedId}}).then(r => {
            setAuthority(r.data.authority)
            const task = r.data.task
            setMediaFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_info.name)}`)
            setMediaInfo({framerate: task.task_file_info.framerate, duration: task.task_file_info.duration})
            setTaskName(`${task.task_name}_${task.task_episode}`)
            setLanguages(r.data.languages.map(value => ({code: value, name: languageCodes[value], counter: 1})))
            setWorkTypeKey(r.data.work_type)
            setWorkEndedAt(r.data.work_ended_at || null)
            setTaskEndedAt(task.task_ended_at || null)
        }).catch(() => navigate('/error'))
    }, [taskHashedId, workHashedId, navigate])

    useEffect(() => {
        if (taskEndedAt === undefined || workEndedAt === undefined) {
        } else if (workEndedAt) {
            let taskId, workId
            const getTaskId = axios.get(`v1/tasks/decode/${taskHashedId}`).then(r => taskId = r.data)
            const getWorkId = axios.get(`v1/works/decode/${workHashedId}`).then(r => workId = r.data)
            Promise.all([getTaskId, getWorkId]).then(() => {
                axios.get(`https://s3.subtitleqc.ai/task/${taskId}/works/${workId}/${workEndedAt}.fspx`, {headers: {Authorization: null}}).then(r => {
                    cellDataRef.current = r.data.subtitle
                    setLanguages(r.data.language)
                    setProjectDetail(r.data.projectDetail)
                })
            })
            setDataInitialized(true)
            setReadOnly(true)
        } else if (taskEndedAt) {
            setReadOnly(true)
            setCrdtMode(true)
        } else {
            setCrdtMode(true)
        }
    }, [taskEndedAt, workEndedAt, taskHashedId, workHashedId]);

    useEffect(() => {
        if (authority === 'local') setTcLock(false)
        else if (authority === 'sync' || authority === 'transcribe') setTcLock(false)
    }, [authority])

    useEffect(() => {
        if (crdtInitialized) {
            const crdt = crdtHandlerRef.current
            const yMap = crdt.yMap()
            crdt.yDoc().transact(() => {
                if (yMap.get('cells')) {
                    cellDataRef.current = yMap.get('cells').toArray().map(value => {
                        return Object.entries(value.toJSON()).reduce((acc, [key, value]) => {
                            if (value) acc[key] = typeof value !== 'object' ? value : value.value;
                            return acc;
                        }, {});
                    })
                } else {
                    const yCellData = cellDataRef.current.map(value => {
                        const map = new Y.Map()
                        Object.entries(value).forEach(([key, value]) => map.set(key, value))
                        return map
                    })
                    yMap.set('cells', Y.Array.from(yCellData))
                }
                yMap.get('cells').observe(event => { // new row
                    let retain, inserts, deletes
                    for (let i = 0; i < event.changes.delta.length; i++) {
                        retain = event.changes.delta[i].retain || retain || 0
                        inserts = event.changes.delta[i].insert?.map(value => ({rowId: value.get('rowId')})) || []
                        deletes = event.changes.delta[i].delete || 0
                    }
                    if (event.transaction.local) {
                        inserts?.forEach((value, i) => cellDataRef.current[retain + i].rowId = value.rowId)
                    } else {
                        cellDataRef.current.splice(retain, deletes, ...inserts)
                        hotRef.current.render()
                    }
                })
                yMap.get('cells').observeDeep(events => {
                    events.forEach(event => {
                        if (!event.transaction.local) {
                            const row = hotRef.current.getSourceDataAtCol('rowId').indexOf(event.target.get('rowId'))
                            const updates = []
                            event.changes.keys.forEach((change, key) => updates.push([row, key, event.target.get(key).value]))
                            hotRef.current.setDataAtRowProp(updates, 'sync')
                        }
                    })
                })
            })
            setDataInitialized(true)
        }
    }, [crdtInitialized]);

    return <>
        {!taskHashedId && <Dropzone dropzoneRef={dropzoneRef} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                                    setLanguageFile={setLanguageFile} languages={languages}/>}
        <FileUploadModal fileUploadModalShow={fileUploadModalShow} setFileUploadModalShow={setFileUploadModalShow}
                         cellDataRef={cellDataRef} waveformRef={waveformRef} resetSegments={resetSegments}
                         languageFile={languageFile} languages={languages} setLanguages={setLanguages}/>
        <MenuToolbar ref={menuToolbarRef} cellDataRef={cellDataRef} languages={languages} setLanguages={setLanguages}
                     hotRef={hotRef} focusedRef={focusedRef} workTypeKey={workTypeKey}
                     projectDetail={projectDetail} setProjectDetail={setProjectDetail}
                     setTcLock={setTcLock} taskName={taskName} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                     setLanguageFile={setLanguageFile} playerRef={playerRef} waveformRef={waveformRef}
                     hotSelectionRef={hotSelectionRef} selectedSegment={selectedSegment}
                     taskHashedId={taskHashedId} workHashedId={workHashedId}
                     taskEndedAt={taskEndedAt} workEndedAt={workEndedAt}
                     crdt={crdtHandlerRef.current} crdtAwarenessInitialized={crdtAwarenessInitialized}
                     findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                     tcLockRef={tcLockRef} tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                     tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                     tcIncreaseButtonRef={tcIncreaseButtonRef} tcDecreaseButtonRef={tcDecreaseButtonRef}
                     insertLineAboveButtonRef={insertLineAboveButtonRef}
                     insertLineBelowButtonRef={insertLineBelowButtonRef} removeLineButtonRef={removeLineButtonRef}
                     splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}/>
        {crdtMode &&
            <CrdtHandler ref={crdtHandlerRef} taskHashedId={taskHashedId} menuToolbarRef={menuToolbarRef}
                         setCrdtInitialized={setCrdtInitialized}
                         setCrdtAwarenessInitialized={setCrdtAwarenessInitialized}/>}
        <div ref={dropzoneRef} className={'w-100 d-flex flex-row justify-content-center position-relative'}
             style={{height: 'calc(100vh - 50px - 40px)'}}>
            <Allotment ref={containerRef} vertical proportionalLayout={false} minSize={300} onReset={() => null}
                       defaultSizes={[window.innerHeight - timelineWindowSize.height, timelineWindowSize.height - 70]}
                       onDragEnd={sizes => {
                           setLanguageWindowSize(prevState => ({width: prevState.width, height: sizes[0] - 40}))
                           setTimelineWindowSize({height: sizes[1] + 70})
                       }}>
                <Allotment defaultSizes={[480, 0]} minSize={50} proportionalLayout={false} onReset={() => null}
                           onDragEnd={sizes => setLanguageWindowSize(prevState => ({
                               width: sizes[1], height: prevState.height
                           }))}>
                    <Allotment.Pane snap>
                        <Allotment vertical proportionalLayout={false} onReset={() => null}>
                            <Allotment.Pane minSize={300}>
                                <MediaWindow hotRef={hotRef} cellDataRef={cellDataRef} languages={languages}
                                             playerRef={playerRef} mediaFile={mediaFile} mediaInfo={mediaInfo}
                                             waveformRef={waveformRef} selectedSegment={selectedSegment}
                                             video={video} setVideo={setVideo} setSubtitleIndex={setSubtitleIndex}/>
                            </Allotment.Pane>
                            <Allotment.Pane minSize={50} snap>
                                <InformationWindow hotRef={hotRef}/>
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment.Pane>
                    <Allotment.Pane ref={languageWindowRef} snap>
                        <TransToolbar setHotFontSize={setHotFontSize} playerRef={playerRef}
                                      hotRef={hotRef} hotSelectionRef={hotSelectionRef} readOnly={readOnly}
                                      tcLockRef={tcLockRef} selectedSegment={selectedSegment}
                                      tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                                      tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                      tcIncreaseButtonRef={tcIncreaseButtonRef}
                                      tcDecreaseButtonRef={tcDecreaseButtonRef}
                                      insertLineAboveButtonRef={insertLineAboveButtonRef}
                                      insertLineBelowButtonRef={insertLineBelowButtonRef}
                                      removeLineButtonRef={removeLineButtonRef}
                                      splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}
                                      findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                                      afterRenderPromise={afterRenderPromise} cellDataRef={cellDataRef}
                                      languages={languages} setLanguages={setLanguages}/>
                        {((taskHashedId && dataInitialized) || !taskHashedId) &&
                            <LanguageWindow focusedRef={focusedRef} size={languageWindowSize} hotRef={hotRef}
                                            hotFontSize={hotFontSize} playerRef={playerRef} waveformRef={waveformRef}
                                            tcLock={tcLock} tcLockRef={tcLockRef} subtitleIndex={subtitleIndex}
                                            cellDataRef={cellDataRef} languages={languages}
                                            readOnly={readOnly} crdt={crdtHandlerRef.current}
                                            crdtAwarenessInitialized={crdtAwarenessInitialized}
                                            guideline={projectDetail.guideline} resetSegments={resetSegments}
                                            selectedSegment={selectedSegment} hotSelectionRef={hotSelectionRef}
                                            taskHashedId={taskHashedId} workHashedId={workHashedId}/>}
                    </Allotment.Pane>
                </Allotment>
                <Allotment.Pane ref={timelineWindowRef} minSize={30} snap>
                    <TimelineWindow focusedRef={focusedRef} size={timelineWindowSize} hotRef={hotRef}
                                    playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile} video={video}
                                    resetSegments={resetSegments}
                                    tcLock={tcLock} tcLockRef={tcLockRef} setTcLock={setTcLock}
                                    tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                                    tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                    selectedSegment={selectedSegment}/>
                </Allotment.Pane>
            </Allotment>
        </div>
    </>
};

export default Production
