import InformationWindow from "./components/InformationWindow";
import LanguageWindow from "./components/LanguageWindow";
import MediaWindow from "./components/MediaWindow";
import MenuToolbar from "./components/MenuToolbar";
import TimelineWindow from "./components/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import TransToolbar from "./components/TransToolbar";
import {defaultLanguage, defaultProjectDetail, defaultSubtitle, guidelines, languageCodes} from "../../utils/config";
import FileUploadModal from "./components/dialogs/FileUploadModal";
import Dropzone from "./components/Dropzone";
import {createSegment, fileExtension, tcToSec} from "../../utils/functions";
import {v4} from "uuid";
import axios from "../../utils/axios";
import {useNavigate} from "react-router-dom";
import {Allotment} from "allotment";
import CrdtHandler from "./components/CrdtHandler";
import './Production.css'

const Production = () => {
    const [, , taskHashedId, workHashedId] = window.location.pathname.split('/')
    const [authority, setAuthority] = useState('')
    const [taskEndedAt, setTaskEndedAt] = useState(undefined)
    const [workEndedAt, setWorkEndedAt] = useState(undefined)
    const navigate = useNavigate()
    const dropzoneRef = useRef(null)
    const [fileUploadModalShow, setFileUploadModalShow] = useState(false)
    const containerRef = useRef(null)
    const languageWindowRef = useRef(null)
    const workWindowRef = useRef(null)
    const timelineWindowRef = useRef(null)
    const [languageWindowSize, setLanguageWindowSize] = useState({width: 0, height: 0})
    const [timelineWindowSize, setTimelineWindowSize] = useState({height: 320})
    const resizingTimeoutRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaInfo, setMediaInfo] = useState(null)
    const [waveformSource, setWaveformSource] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const [projectDetail, setProjectDetail] = useState(defaultProjectDetail())
    const playerRef = useRef(null)
    const waveformRef = useRef(null)
    const cellDataRef = useRef(null)
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
    const [tcLock, setTcLock] = useState(false)
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
    const [hotInitialized, setHotInitialized] = useState(false)

    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const timeOut = setTimeout(() => {
                hotRef.current.removeHook('afterRender', afterRenderCallback)
                resolve()
            }, 100)
            const afterRenderCallback = (isForced) => {
                clearTimeout(timeOut)
                if (!isForced) resolve()
            }
            hotRef.current?.addHookOnce('afterRender', afterRenderCallback)
        })
    }, [])
    const resetSegments = useCallback(() => {
        const segments = []
        cellDataRef.current?.forEach((value) => {
            const [start, end] = [tcToSec(value.start), tcToSec(value.end)]
            if (0 <= start && start <= end) segments.push(createSegment(start, end, value.rowId, languages[0] ? value[`${languages[0].code}_${languages[0].counter}`] : '', !tcLock))
        })
        selectedSegment.current = null
        return segments
    }, [languages, tcLock])

    useEffect(() => {
        const handleLanguageWindowResize = () => {
            clearTimeout(resizingTimeoutRef.current);
            resizingTimeoutRef.current = setTimeout(() => {
                setLanguageWindowSize({
                    width: workWindowRef.current.offsetWidth, height: workWindowRef.current.offsetHeight - 40
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
        if (dataInitialized && waveformRef.current) {
            waveformRef.current.segments.removeAll()
            waveformRef.current.segments.add(resetSegments())
        }
    }, [taskHashedId, dataInitialized, resetSegments])

    useEffect(() => {
        if (!taskHashedId && dataInitialized) localStorage.setItem('language', JSON.stringify(languages))
    }, [taskHashedId, languages, dataInitialized]);

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
            } else setFileUploadModalShow(true)
        }
    }, [languageFile])

    useEffect(() => {
        if (!hotInitialized) return
        if (!taskHashedId) {
            setAuthority('local')
            if (localStorage.language) setLanguages(JSON.parse(localStorage.language))
            if (localStorage.subtitle) cellDataRef.current = JSON.parse(localStorage.subtitle)
            else cellDataRef.current = defaultSubtitle()
            if (localStorage.projectDetail) setProjectDetail(JSON.parse(localStorage.projectDetail))
            setDataInitialized(true)
        } else {
            axios.get(`v1/tasks/access/${taskHashedId}`, {params: {work_hashed_id: workHashedId}}).then(r => {
                setAuthority(r.data.authority)
                const task = r.data.task
                setMediaFile(`task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_info.name)}`)
                setMediaInfo({framerate: task.task_file_info.framerate, duration: task.task_file_info.duration})
                setLanguages(r.data.languages.map(value => ({code: value, name: languageCodes[value], counter: 1})))
                setProjectDetail(prevState => ({
                    name: `${task.task_name}_${task.task_episode}`,
                    guideline: r.data.task.project_guideline ? guidelines.get(r.data.task.project_guideline) : prevState.guideline
                }))
                setWorkTypeKey(r.data.work_type)
                setWorkEndedAt(r.data.work_ended_at || null)
                setTaskEndedAt(task.task_ended_at || null)
            }).catch(() => navigate('/error'))
        }
    }, [hotInitialized, taskHashedId, workHashedId, navigate])

    useEffect(() => {
        if (taskEndedAt === undefined || workEndedAt === undefined) {
        } else if (workEndedAt) {
            let taskId, workId
            const getTaskId = axios.get(`v1/tasks/decode/${taskHashedId}`).then(r => taskId = r.data)
            const getWorkId = axios.get(`v1/works/decode/${workHashedId}`).then(r => workId = r.data)
            Promise.all([getTaskId, getWorkId]).then(() => {
                axios.get(`https://s3.subtitleqc.ai/task/${taskId}/works/${workId}/${workEndedAt}.fspx`, {
                    headers: {Authorization: null}, withCredentials: true
                }).then(r => {
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
        if (crdtInitialized) {
            const crdt = crdtHandlerRef.current
            const yMap = crdt.yMap()
            if (yMap.get('cells')) {
                cellDataRef.current = yMap.get('cells').toArray().map(value => {
                    return Object.entries(value.toJSON()).reduce((acc, [key, value]) => {
                        if (value) acc[key] = typeof value !== 'object' ? value : value.value;
                        return acc;
                    }, {});
                })
                yMap.get('cells').observe(event => { // row changes
                    let retain, inserts, deletes
                    event.changes.delta.forEach(change => {
                        retain = change.retain || retain || 0
                        inserts = change.insert?.map(value => ({rowId: value.get('rowId')})) || []
                        deletes = change.delete || deletes || 0
                    })
                    if (!event.transaction.local) {
                        let editingValue, row, col
                        if (hotRef.current.getActiveEditor()?.state === 'STATE_EDITING') {
                            editingValue = hotRef.current.getActiveEditor().getValue()
                            row = hotRef.current.getActiveEditor().cellProperties.row
                            col = hotRef.current.getActiveEditor().cellProperties.col
                            hotRef.current.getActiveEditor().finishEditing(true)
                        }
                        cellDataRef.current.splice(retain, deletes, ...inserts)
                        hotRef.current.render()
                        if (editingValue) {
                            hotRef.current.selectCell(row - deletes + inserts.length, col)
                            hotRef.current.getActiveEditor().beginEditing()
                            hotRef.current.getActiveEditor().setValue(editingValue)
                        }
                        languageWindowRef.current.setTotalLines()
                    }
                })
                yMap.get('cells').observeDeep(events => {
                    const updates = []
                    events.forEach(event => {
                        if (!event.transaction.local) {
                            const row = hotRef.current.getSourceDataAtCol('rowId').indexOf(event.target.get('rowId'))
                            event.changes.keys.forEach((change, key) => updates.push([row, key, event.target.get(key).value]))
                        }
                    })
                    let editingValue = null
                    if (hotRef.current.getActiveEditor()?.state === 'STATE_EDITING') editingValue = hotRef.current.getActiveEditor().getValue()
                    hotRef.current.setDataAtRowProp(updates, 'sync')
                    if (editingValue) hotRef.current.getActiveEditor().setValue(editingValue)
                })
            }
            setDataInitialized(true)
        }
    }, [crdtInitialized]);

    return <>
        <Dropzone dropzoneRef={dropzoneRef} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                  taskHashedId={taskHashedId} setLanguageFile={setLanguageFile} languages={languages}/>
        <FileUploadModal fileUploadModalShow={fileUploadModalShow} setFileUploadModalShow={setFileUploadModalShow}
                         hotRef={hotRef} waveformRef={waveformRef} resetSegments={resetSegments}
                         languageFile={languageFile} languages={languages} setLanguages={setLanguages}/>
        <MenuToolbar ref={menuToolbarRef} cellDataRef={cellDataRef} languages={languages} setLanguages={setLanguages}
                     hotRef={hotRef} hotSelectionRef={hotSelectionRef} workTypeKey={workTypeKey}
                     projectDetail={projectDetail} setProjectDetail={setProjectDetail}
                     setTcLock={setTcLock} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                     setLanguageFile={setLanguageFile} playerRef={playerRef} waveformRef={waveformRef}
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
        {crdtMode && <CrdtHandler ref={crdtHandlerRef} taskHashedId={taskHashedId} menuToolbarRef={menuToolbarRef}
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
                                             waveformRef={waveformRef} hotSelectionRef={hotSelectionRef}
                                             setWaveformSource={setWaveformSource}
                                             subtitleIndex={subtitleIndex} setSubtitleIndex={setSubtitleIndex}/>
                            </Allotment.Pane>
                            <Allotment.Pane minSize={50} snap>
                                <InformationWindow hotRef={hotRef} projectDetail={projectDetail}/>
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment.Pane>
                    <Allotment.Pane ref={workWindowRef} snap>
                        <TransToolbar setHotFontSize={setHotFontSize} playerRef={playerRef} taskHashedId={taskHashedId}
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
                        <LanguageWindow ref={languageWindowRef} size={languageWindowSize} hotRef={hotRef}
                                        hotFontSize={hotFontSize} playerRef={playerRef} waveformRef={waveformRef}
                                        tcLock={tcLock} tcLockRef={tcLockRef}
                                        subtitleIndex={subtitleIndex} setSubtitleIndex={setSubtitleIndex}
                                        cellDataRef={cellDataRef} languages={languages}
                                        readOnly={readOnly} crdt={crdtHandlerRef.current}
                                        setHotInitialized={setHotInitialized} dataInitialized={dataInitialized}
                                        crdtAwarenessInitialized={crdtAwarenessInitialized}
                                        guideline={projectDetail.guideline} resetSegments={resetSegments}
                                        selectedSegment={selectedSegment} hotSelectionRef={hotSelectionRef}
                                        taskHashedId={taskHashedId} workHashedId={workHashedId}/>
                    </Allotment.Pane>
                </Allotment>
                <Allotment.Pane ref={timelineWindowRef} minSize={30} snap>
                    <TimelineWindow size={timelineWindowSize} hotRef={hotRef} resetSegments={resetSegments}
                                    playerRef={playerRef} waveformRef={waveformRef} waveformSource={waveformSource}
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
