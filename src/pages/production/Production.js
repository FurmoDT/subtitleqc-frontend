import InformationWindow from "./components/InformationWindow";
import LanguageWindow from "./components/LanguageWindow";
import MediaWindow from "./components/MediaWindow";
import MenuToolbar from "./components/MenuToolbar";
import TimelineWindow from "./components/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import TransToolbar from "./components/TransToolbar";
import {defaultLanguage, defaultProjectDetail, defaultSubtitle} from "../../utils/config";
import FileUploadModal from "./components/dialogs/FileUploadModal";
import Dropzone from "./components/Dropzone";
import {createSegment, fileExtension, tcToSec} from "../../utils/functions";
import {v4} from "uuid";
import axios from "../../utils/axios";
import {useNavigate} from "react-router-dom";
import {Allotment} from "allotment";


const Production = () => {
    const [, , taskHashedId, workHashedId] = window.location.pathname.split('/')
    const [authority, setAuthority] = useState('')
    const [taskName, setTaskName] = useState('')
    // const [endedAt, setEndedAt] = useState(null)
    const navigate = useNavigate()
    const dropzoneRef = useRef(null)
    const [fileUploadModalShow, setFileUploadModalShow] = useState(false)
    const containerRef = useRef(null)
    const languageWindowRef = useRef(null)
    const timelineWindowRef = useRef(null)
    const [languageWindowSize, setLanguageWindowSize] = useState({width: 0, height: 0})
    const [timelineWindowSize, setTimelineWindowSize] = useState({height: 320})
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaInfo, setMediaInfo] = useState(null)
    const [video, setVideo] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const [projectDetail, setProjectDetail] = useState(localStorage.projectDetail ? JSON.parse(localStorage.projectDetail) : defaultProjectDetail())
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
    const splitLineButtonRef = useRef(null)
    const mergeLineButtonRef = useRef(null)
    const findButtonRef = useRef(null)
    const replaceButtonRef = useRef(null)
    const selectedSegment = useRef(null)
    const [tcLock, setTcLock] = useState(true)
    const tcLockRef = useRef(true)
    const isFromLanguageWindowRef = useRef(false)
    const subtitleIndexRef = useRef(0)
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
            if (0 <= start && end) segments.push(createSegment(start, end, value.rowId))
        })
        selectedSegment.current = null
        return segments
    }, [])

    useEffect(() => {
        if (!dataInitialized) return
        if (!taskHashedId) localStorage.setItem('language', JSON.stringify(languages))
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
        const observer = new ResizeObserver(() => {
            containerRef.current.resize([dropzoneRef.current.offsetHeight - timelineWindowRef.current.childNodes[1].offsetHeight, timelineWindowRef.current.childNodes[1].offsetHeight])
            setLanguageWindowSize({
                width: languageWindowRef.current.offsetWidth, height: languageWindowRef.current.offsetHeight - 40
            })
            setTimelineWindowSize(prevState => ({height: prevState.height}))
        });
        observer.observe(dropzoneRef.current);
        return () => observer.disconnect()
    }, []);

    useEffect(() => {
        if (!taskHashedId) {
            setAuthority('test')
            if (localStorage.language?.length) setLanguages(JSON.parse(localStorage.language))
            if (localStorage.subtitle) cellDataRef.current = JSON.parse(localStorage.subtitle)
            setDataInitialized(true)
            return
        }
        axios.get(`v1/task/access`, {
            params: {hashed_id: taskHashedId, work_hashed_id: workHashedId}
        }).then((response) => {
            setAuthority(response.data.authority)
            const task = response.data.task
            setMediaFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_info.name)}`)
            setMediaInfo({framerate: task.task_file_info.framerate, duration: task.task_file_info.duration})
            setTaskName(`${task.task_name}_${task.task_episode}`)
            // setEndedAt(response.data.task.task_ended_at || response.data.ended_at)
        }).catch(() => navigate('/error'))
    }, [taskHashedId, workHashedId, navigate])

    return <>
        <Dropzone dropzoneRef={dropzoneRef} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                  setLanguageFile={setLanguageFile} languages={languages}/>
        <FileUploadModal fileUploadModalShow={fileUploadModalShow} setFileUploadModalShow={setFileUploadModalShow}
                         cellDataRef={cellDataRef} languageFile={languageFile} setLanguages={setLanguages}
                         waveformRef={waveformRef} resetSegments={resetSegments}/>
        <MenuToolbar cellDataRef={cellDataRef} languages={languages} setLanguages={setLanguages} hotRef={hotRef}
                     focusedRef={focusedRef} projectDetail={projectDetail} setProjectDetail={setProjectDetail}
                     setTcLock={setTcLock} taskName={taskName} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                     setLanguageFile={setLanguageFile} playerRef={playerRef} waveformRef={waveformRef}
                     findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                     tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                     tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                     splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}/>
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
                                             waveformRef={waveformRef} isFromLanguageWindowRef={isFromLanguageWindowRef}
                                             video={video} setVideo={setVideo} subtitleIndexRef={subtitleIndexRef}/>
                            </Allotment.Pane>
                            <Allotment.Pane minSize={50} snap>
                                <InformationWindow/>
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment.Pane>
                    <Allotment.Pane ref={languageWindowRef} snap>
                        <TransToolbar setHotFontSize={setHotFontSize} playerRef={playerRef}
                                      hotRef={hotRef} hotSelectionRef={hotSelectionRef}
                                      tcLockRef={tcLockRef} selectedSegment={selectedSegment}
                                      tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                                      tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                      splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}
                                      findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                                      afterRenderPromise={afterRenderPromise} cellDataRef={cellDataRef}
                                      languages={languages} setLanguages={setLanguages}/>
                        <LanguageWindow focusedRef={focusedRef} size={languageWindowSize} hotRef={hotRef}
                                        hotFontSize={hotFontSize} playerRef={playerRef} waveformRef={waveformRef}
                                        tcLock={tcLock} tcLockRef={tcLockRef} cellDataRef={cellDataRef}
                                        hotSelectionRef={hotSelectionRef} languages={languages}
                                        guideline={projectDetail.guideline} resetSegments={resetSegments}
                                        selectedSegment={selectedSegment} subtitleIndexRef={subtitleIndexRef}
                                        isFromLanguageWindowRef={isFromLanguageWindowRef}
                                        taskHashedId={taskHashedId} workHashedId={workHashedId}/>
                    </Allotment.Pane>
                </Allotment>
                <Allotment.Pane ref={timelineWindowRef} minSize={30} snap>
                    <TimelineWindow focusedRef={focusedRef} size={timelineWindowSize} hotRef={hotRef}
                                    playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile} video={video}
                                    resetSegments={resetSegments} tcLockRef={tcLockRef} setTcLock={setTcLock}
                                    tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                                    tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                    selectedSegment={selectedSegment}/>
                </Allotment.Pane>
            </Allotment>
        </div>
    </>
};

export default Production
