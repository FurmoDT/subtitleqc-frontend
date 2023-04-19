import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import Splitter from "m-react-splitters";
import "../css/Splitter.css"
import TransToolbar from "../components/production/TransToolbar";
import {defaultLanguage, defaultProjectDetail, defaultSubtitle} from "../utils/config";
import FileUploadModal from "../components/production/dialogs/FileUploadModal";
import Dropzone from "../components/production/Dropzone";
import {createSegment, tcToSec} from "../utils/functions";
import {v4} from "uuid";

const Production = () => {
    const dropzoneRef = useRef(null)
    const [fileUploadModalShow, setFileUploadModalShow] = useState(false)
    const rightRef = useRef(null)
    const [rightRefSize, setRightRefSize] = useState({width: 0, languageWindowHeight: 0, timelineWindowHeight: 0})
    const LanguageTimelineSplitterRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [mediaInfo, setMediaInfo] = useState(null)
    const [video, setVideo] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const [projectDetail, setProjectDetail] = useState(localStorage.projectDetail ? JSON.parse(localStorage.projectDetail) : defaultProjectDetail())
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
    const tcIoButtonRef = useRef(null)
    const tcInButtonRef = useRef(null)
    const tcOutButtonRef = useRef(null)
    const splitLineButtonRef = useRef(null)
    const mergeLineButtonRef = useRef(null)
    const findButtonRef = useRef(null)
    const replaceButtonRef = useRef(null)
    const resetSegmentsRef = useRef(null)
    const [tcLock, setTcLock] = useState(true)
    const tcLockRef = useRef(true)
    const isFromTimelineWindowRef = useRef(false)
    const isFromLanguageWindowRef = useRef(false)
    const subtitleIndexRef = useRef(0)
    const fnIndexRef = useRef(0)
    const setTdColor = useCallback((index) => {
        hotRef.current.getCell(index, 0)?.parentElement.querySelectorAll('td').forEach(tdElement => {
            tdElement.style.backgroundColor = 'beige'
            tdElement.style.color = 'black'
        });
    }, [])
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
        if (!fnToggle) {
            cellDataRef.current.forEach((value) => {
                const [start, end] = [tcToSec(value.start), tcToSec(value.end)]
                if (0 <= start && end && start <= end) segments.push(createSegment(start, end, value.rowId, tcLock))
            })
        } else {
            fnRef.current.forEach((value) => {
                const [start, end] = [tcToSec(value.start), tcToSec(value.end)]
                if (0 <= start && end && start <= end) segments.push(createSegment(start, end, value.rowId, tcLock))
            })
        }
        return segments
    }, [fnToggle, tcLock])
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
        }
        tcLockRef.current = tcLock
    }, [fnToggle, tcLock])
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
            } else setFileUploadModalShow(true)
            if (waveformRef.current) {
                waveformRef.current.segments.removeAll()
                waveformRef.current.segments.add(resetSegmentsRef.current())
            }
        }
    }, [languageFile])
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const {width} = entry.contentRect;
                setRightRefSize({
                    width: width,
                    languageWindowHeight: LanguageTimelineSplitterRef.current.panePrimary.div.offsetHeight,
                    timelineWindowHeight: LanguageTimelineSplitterRef.current.paneNotPrimary.div.offsetHeight + 10
                })
            }
        });
        observer.observe(rightRef.current);
        return () => observer.disconnect()
    }, []);
    return <>
        <Dropzone dropzoneRef={dropzoneRef} setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                  fnToggleRef={fnToggleRef} setLanguageFile={setLanguageFile}
                  languages={languages} fnLanguages={fnLanguages}/>
        <FileUploadModal fileUploadModalShow={fileUploadModalShow} setFileUploadModalShow={setFileUploadModalShow}
                         fnToggleRef={fnToggleRef} cellDataRef={cellDataRef} fnRef={fnRef} languageFile={languageFile}
                         setLanguages={setLanguages} setFnLanguages={setFnLanguages} waveformRef={waveformRef}
                         resetSegments={resetSegments}/>
        <MenuToolbar cellDataRef={cellDataRef} fnRef={fnRef} languages={languages} setLanguages={setLanguages}
                     fnLanguages={fnLanguages} setFnLanguages={setFnLanguages} hotRef={hotRef}
                     projectDetail={projectDetail} setProjectDetail={setProjectDetail} setTcLock={setTcLock}
                     setMediaFile={setMediaFile} setMediaInfo={setMediaInfo}
                     setLanguageFile={setLanguageFile} playerRef={playerRef} waveformRef={waveformRef}
                     findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                     tcIoButtonRef={tcIoButtonRef} tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                     splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}/>
        <div ref={dropzoneRef} style={{
            flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px',
            width: '100vw', height: 'calc(100vh - 100px)', position: 'relative'
        }}>
            <div id={'splitter-wrapper'} style={{width: '100%', height: '100%', position: 'relative'}}>
                <Splitter position={'vertical'} primaryPaneWidth={'500px'} postPoned
                          primaryPaneMaxWidth={'100%'} primaryPaneMinWidth={0}>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
                        <Splitter position={'horizontal'} primaryPaneHeight={'30%'} postPoned>
                            <MediaWindow hotRef={hotRef} cellDataRef={cellDataRef} fnRef={fnRef} fnToggle={fnToggle}
                                         languages={languages} fnLanguages={fnLanguages} playerRef={playerRef}
                                         mediaFile={mediaFile} mediaInfo={mediaInfo} video={video} setVideo={setVideo}
                                         waveformRef={waveformRef} isFromLanguageWindowRef={isFromLanguageWindowRef}
                                         subtitleIndexRef={subtitleIndexRef} fnIndexRef={fnIndexRef}
                                         afterRenderPromise={afterRenderPromise} setTdColor={setTdColor}/>
                            <InformationWindow/>
                        </Splitter>
                    </div>
                    <div ref={rightRef} style={{
                        flexDirection: 'column', display: 'flex', width: '100%', height: '100%',
                        borderStyle: 'solid', borderWidth: 'thin'
                    }}>
                        <TransToolbar setHotFontSize={setHotFontSize} playerRef={playerRef}
                                      fnToggle={fnToggle} setFnToggle={setFnToggle}
                                      hotRef={hotRef} hotSelectionRef={hotSelectionRef} tcIoButtonRef={tcIoButtonRef}
                                      tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                      splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}
                                      findButtonRef={findButtonRef} replaceButtonRef={replaceButtonRef}
                                      afterRenderPromise={afterRenderPromise}
                                      languages={languages} setLanguages={setLanguages}
                                      fnLanguages={fnLanguages} setFnLanguages={setFnLanguages}/>
                        <Splitter ref={LanguageTimelineSplitterRef} position={'horizontal'}
                                  primaryPaneHeight={'calc(100% - 300px)'}
                                  onDragFinished={() => {
                                      setRightRefSize({
                                          ...rightRefSize,
                                          languageWindowHeight: LanguageTimelineSplitterRef.current.panePrimary.div.offsetHeight,
                                          timelineWindowHeight: LanguageTimelineSplitterRef.current.paneNotPrimary.div.offsetHeight + 10
                                      })
                                  }}>
                            <LanguageWindow size={rightRefSize} hotRef={hotRef} playerRef={playerRef}
                                            hotFontSize={hotFontSize} hotSelectionRef={hotSelectionRef}
                                            waveformRef={waveformRef} fnToggle={fnToggle}
                                            tcLock={tcLock} tcLockRef={tcLockRef} setTdColor={setTdColor}
                                            cellDataRef={cellDataRef} languages={languages}
                                            guideline={projectDetail.guideline}
                                            isFromTimelineWindowRef={isFromTimelineWindowRef}
                                            isFromLanguageWindowRef={isFromLanguageWindowRef}
                                            subtitleIndexRef={subtitleIndexRef} fnIndexRef={fnIndexRef}
                                            fnRef={fnRef} fnLanguages={fnLanguages}/>
                            <TimelineWindow size={rightRefSize} resetSegments={resetSegments} hotRef={hotRef}
                                            isFromTimelineWindowRef={isFromTimelineWindowRef} playerRef={playerRef}
                                            waveformRef={waveformRef} mediaFile={mediaFile} video={video}
                                            tcLockRef={tcLockRef} setTcLock={setTcLock}/>
                        </Splitter>
                    </div>
                </Splitter>
            </div>
        </div>
    </>
};

export default Production
