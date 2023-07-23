import InformationWindow from "./components/InformationWindow";
import LanguageWindow from "./components/LanguageWindow";
import MediaWindow from "./components/MediaWindow";
import MenuToolbar from "./components/MenuToolbar";
import TimelineWindow from "./components/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import "../../css/Splitter.css"
import TransToolbar from "./components/TransToolbar";
import {defaultLanguage, defaultProjectDetail, defaultSubtitle} from "../../utils/config";
import FileUploadModal from "./components/dialogs/FileUploadModal";
import Dropzone from "./components/Dropzone";
import {createSegment, tcToSec} from "../../utils/functions";
import {v4} from "uuid";
import SplitterLayout from 'react-splitter-layout-react-v18';
import axios from "../../utils/axios";

const Production = ({updateIsRendered}) => {
    const pathname = window.location.pathname
    const dropzoneRef = useRef(null)
    const [fileUploadModalShow, setFileUploadModalShow] = useState(false)
    const languageSplitter = useRef(null)
    const timelineSplitter = useRef(null)
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
    const [hotFontSize, setHotFontSize] = useState('13px')
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
    const selectedSegment = useRef(null);
    const resetSegmentsRef = useRef(null)
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
            if (0 <= start && end && start <= end) segments.push(createSegment(start, end, value.rowId))
        })
        selectedSegment.current = null
        return segments
    }, [])

    useEffect(() => {
        resetSegmentsRef.current = resetSegments
    }, [resetSegments])

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
            waveformRef.current.segments.add(resetSegmentsRef.current())
            selectedSegment.current = null
        }
    }, [fnToggle])

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
                cellDataRef.current = languageFile.subtitle.map(v => {
                    return {...v, rowId: v.rowId || v4()}
                })
                fnRef.current = (languageFile.fn || languageFile.fx).map(v => {
                    return {...v, rowId: v.rowId || v4()}
                })
                localStorage.setItem('subtitle', JSON.stringify(cellDataRef.current))
                localStorage.setItem('fn', JSON.stringify(fnRef.current))
                setLanguages(languageFile.language)
                setFnLanguages(languageFile.fnLanguage || languageFile.fxLanguage)
                setProjectDetail(languageFile.projectDetail)
                if (waveformRef.current) {
                    waveformRef.current.segments.removeAll()
                    waveformRef.current.segments.add(resetSegmentsRef.current())
                }
            } else setFileUploadModalShow(true)
        }
    }, [languageFile])

    useEffect(() => {
        const observer = new ResizeObserver(() => {
            setLanguageWindowSize({
                width: languageSplitter.current.container.lastChild.offsetWidth,
                height: languageSplitter.current.container.lastChild.offsetHeight - 40
            })
        });
        observer.observe(dropzoneRef.current);
        return () => observer.disconnect()
    }, []);

    useEffect(()=>{
        if (!pathname.split('/')[2]) return
        axios.get(`v1/project/task`, {params: {hashed_id: pathname.split('/')[2]}}).then((respond)=>{
            setMediaFile(`https://s3.subtitleqc.ai/task/${respond.data.task_id}/source/original_v${respond.data.task_file_version}.${respond.data.task_file_extension}`)
        })
    }, [pathname])

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
                     setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                     setLanguageFile={setLanguageFile} playerRef={playerRef} waveformRef={waveformRef}
                     findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                     tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                     tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                     splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}/>
        <div ref={dropzoneRef}>
            <SplitterLayout ref={timelineSplitter} vertical={true} secondaryInitialSize={250} onDragEnd={()=>{
                setLanguageWindowSize({...languageWindowSize, height: timelineSplitter.current.container.firstChild.offsetHeight - 40})
                setTimelineWindowSize({height: timelineSplitter.current.container.lastChild.offsetHeight + 70})
            }            }>
                <SplitterLayout ref={languageSplitter} vertical={false} primaryIndex={1} secondaryInitialSize={480} onDragEnd={() => {
                    setTimeout(() => setLanguageWindowSize({
                        ...languageWindowSize,
                        width: languageSplitter.current.container.lastChild.offsetWidth
                    }), 100)
                }}>
                    <SplitterLayout vertical={true} secondaryMinSize={200} secondaryInitialSize={300} primaryIndex={1}>
                        <MediaWindow hotRef={hotRef} cellDataRef={cellDataRef} fnRef={fnRef} fnToggle={fnToggle}
                                     languages={languages} fnLanguages={fnLanguages} playerRef={playerRef}
                                     mediaFile={mediaFile} mediaInfo={mediaInfo} video={video} setVideo={setVideo}
                                     waveformRef={waveformRef} isFromLanguageWindowRef={isFromLanguageWindowRef}
                                     subtitleIndexRef={subtitleIndexRef} fnIndexRef={fnIndexRef}/>
                        <InformationWindow/>
                    </SplitterLayout>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
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
                                        guideline={projectDetail.guideline} resetSegments={resetSegments}
                                        isFromTimelineWindowRef={isFromTimelineWindowRef}
                                        isFromLanguageWindowRef={isFromLanguageWindowRef}
                                        subtitleIndexRef={subtitleIndexRef} fnIndexRef={fnIndexRef}/>
                    </div>
                </SplitterLayout>
                <TimelineWindow focusedRef={focusedRef} size={timelineWindowSize} hotRef={hotRef}
                                isFromTimelineWindowRef={isFromTimelineWindowRef} playerRef={playerRef}
                                waveformRef={waveformRef} mediaFile={mediaFile} video={video}
                                resetSegments={resetSegments} tcLockRef={tcLockRef} setTcLock={setTcLock}
                                tcOffsetButtonRef={tcOffsetButtonRef} tcIoButtonRef={tcIoButtonRef}
                                tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                selectedSegment={selectedSegment} updateIsRendered={updateIsRendered}/>
            </SplitterLayout>
        </div>
    </>
};

export default Production
