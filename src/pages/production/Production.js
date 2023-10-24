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
    const cellDataRef = useRef(localStorage.subtitle ? JSON.parse(localStorage.subtitle) : defaultSubtitle())
    const fnRef = useRef(localStorage.fn ? JSON.parse(localStorage.fn) : defaultSubtitle())
    const [languages, setLanguages] = useState(localStorage.language ? JSON.parse(localStorage.language) : defaultLanguage())
    const [fnLanguages, setFnLanguages] = useState(localStorage.fnLanguage ? JSON.parse(localStorage.fnLanguage) : defaultLanguage())
    const hotRef = useRef(null)
    const hotSelectionRef = useRef({rowStart: null, columnStart: null, rowEnd: null, columnEnd: null})
    const [hotFontSize, setHotFontSize] = useState('14px')
    const [fnToggle, setFnToggle] = useState(false)
    const fnToggleRef = useRef(fnToggle)
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
    const isFromTimelineWindowRef = useRef(false)
    const isFromLanguageWindowRef = useRef(false)
    const subtitleIndexRef = useRef(0)
    const fnIndexRef = useRef(0)
    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const timeOut = setTimeout(() => {
                hotRef.current.removeHook('afterRender', afterRenderCallback)
                resolve()
            }, 100)
            const afterRenderCallback = (isForced) => {
                clearTimeout(timeOut)
                if (!isForced) {
                    hotRef.current.removeHook('afterRender', afterRenderCallback)
                    resolve()
                }
            }
            hotRef.current?.addHookOnce('afterRender', afterRenderCallback)
        })
    }, [])
    const resetSegments = useCallback(() => {
        const segments = []
        const source = fnToggleRef.current ? fnRef.current : cellDataRef.current
        source.forEach((value) => {
            const [start, end] = [tcToSec(value.start), tcToSec(value.end)]
            if (0 <= start && end) segments.push(createSegment(start, end, value.rowId))
        })
        selectedSegment.current = null
        return segments
    }, [])

    useEffect(() => {
        localStorage.setItem('language', JSON.stringify(languages))
    }, [languages])

    useEffect(() => {
        localStorage.setItem('fnLanguage', JSON.stringify(fnLanguages))
    }, [fnLanguages])

    useEffect(() => {
        fnToggleRef.current = fnToggle
        if (waveformRef.current) {
            waveformRef.current.segments.removeAll()
            waveformRef.current.segments.add(resetSegments())
            selectedSegment.current = null
        }
    }, [fnToggle, resetSegments])

    useEffect(() => {
        tcLockRef.current = tcLock
        if (selectedSegment.current) {
            selectedSegment.current.update({color: 'white', editable: false})
            selectedSegment.current = null
        }
    }, [tcLock])

    useEffect(() => {
        if (languageFile) {
            if (languageFile.fn || languageFile.fx) { // fspx
                cellDataRef.current = languageFile.subtitle.map(v => ({...v, rowId: v.rowId || v4()}))
                fnRef.current = (languageFile.fn || languageFile.fx).map(v => ({...v, rowId: v.rowId || v4()}))
                localStorage.setItem('subtitle', JSON.stringify(cellDataRef.current))
                localStorage.setItem('fn', JSON.stringify(fnRef.current))
                setLanguages(languageFile.language)
                setFnLanguages(languageFile.fnLanguage || languageFile.fxLanguage)
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
            return
        }
        axios.get(`v1/task/access`, {
            params: {hashed_id: taskHashedId, work_hashed_id: workHashedId}
        }).then((response) => {
            setAuthority(response.data.authority)
            const task = response.data.task
            setMediaFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_info?.name)}`)
            setTaskName(`${task.task_name}_${task.task_episode}`)
            // setEndedAt(response.data.task.task_ended_at || response.data.ended_at)
        }).catch(() => navigate('/error'))
    }, [taskHashedId, workHashedId, navigate])

    return <>
        <Dropzone dropzoneRef={dropzoneRef} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                  fnToggleRef={fnToggleRef} setLanguageFile={setLanguageFile}
                  languages={languages} fnLanguages={fnLanguages}/>
        <FileUploadModal fileUploadModalShow={fileUploadModalShow} setFileUploadModalShow={setFileUploadModalShow}
                         fnToggleRef={fnToggleRef} cellDataRef={cellDataRef} fnRef={fnRef} languageFile={languageFile}
                         setLanguages={setLanguages} setFnLanguages={setFnLanguages} waveformRef={waveformRef}
                         resetSegments={resetSegments}/>
        <MenuToolbar cellDataRef={cellDataRef} fnRef={fnRef} languages={languages} setLanguages={setLanguages}
                     fnLanguages={fnLanguages} setFnLanguages={setFnLanguages} hotRef={hotRef} focusedRef={focusedRef}
                     projectDetail={projectDetail} setProjectDetail={setProjectDetail} setTcLock={setTcLock}
                     taskName={taskName} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                     setLanguageFile={setLanguageFile} playerRef={playerRef} waveformRef={waveformRef}
                     findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                     tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                     tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                     splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}/>
        <div ref={dropzoneRef} className={'d-flex flex-row justify-content-center position-relative'}
             style={{width: '100vw', height: 'calc(100vh - 50px - 40px)'}}>
            <Allotment ref={containerRef} vertical proportionalLayout={false} minSize={300}
                       defaultSizes={[window.innerHeight - timelineWindowSize.height, timelineWindowSize.height - 70]}
                       onReset={() => null} onDragEnd={sizes => {
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
                                <MediaWindow hotRef={hotRef} cellDataRef={cellDataRef} fnRef={fnRef} fnToggle={fnToggle}
                                             languages={languages} fnLanguages={fnLanguages} playerRef={playerRef}
                                             mediaFile={mediaFile} mediaInfo={mediaInfo} video={video}
                                             setVideo={setVideo}
                                             waveformRef={waveformRef} isFromLanguageWindowRef={isFromLanguageWindowRef}
                                             subtitleIndexRef={subtitleIndexRef} fnIndexRef={fnIndexRef}/>
                            </Allotment.Pane>
                            <Allotment.Pane minSize={50} snap>
                                <InformationWindow/>
                            </Allotment.Pane>
                        </Allotment>
                    </Allotment.Pane>
                    <Allotment.Pane ref={languageWindowRef} snap>
                        <TransToolbar setHotFontSize={setHotFontSize} playerRef={playerRef}
                                      fnToggle={fnToggle} setFnToggle={setFnToggle}
                                      hotRef={hotRef} hotSelectionRef={hotSelectionRef}
                                      tcLockRef={tcLockRef} selectedSegment={selectedSegment}
                                      tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                                      tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                      splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}
                                      findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                                      afterRenderPromise={afterRenderPromise}
                                      languages={languages} setLanguages={setLanguages}
                                      fnLanguages={fnLanguages} setFnLanguages={setFnLanguages}/>
                        <LanguageWindow focusedRef={focusedRef} size={languageWindowSize} hotRef={hotRef}
                                        hotFontSize={hotFontSize} hotSelectionRef={hotSelectionRef}
                                        playerRef={playerRef} waveformRef={waveformRef} fnToggle={fnToggle}
                                        tcLock={tcLock} tcLockRef={tcLockRef} cellDataRef={cellDataRef}
                                        languages={languages} fnRef={fnRef} fnLanguages={fnLanguages}
                                        guideline={projectDetail.guideline}
                                        resetSegments={resetSegments} selectedSegment={selectedSegment}
                                        isFromTimelineWindowRef={isFromTimelineWindowRef}
                                        isFromLanguageWindowRef={isFromLanguageWindowRef}
                                        subtitleIndexRef={subtitleIndexRef} fnIndexRef={fnIndexRef}/>
                    </Allotment.Pane>
                </Allotment>
                <Allotment.Pane ref={timelineWindowRef} minSize={250} snap>
                    <TimelineWindow focusedRef={focusedRef} size={timelineWindowSize} hotRef={hotRef}
                                    isFromTimelineWindowRef={isFromTimelineWindowRef} playerRef={playerRef}
                                    waveformRef={waveformRef} mediaFile={mediaFile} video={video}
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
