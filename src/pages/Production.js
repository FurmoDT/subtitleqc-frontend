import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import Splitter from "m-react-splitters";
import "../css/Splitter.css"
import TransToolbar from "../components/production/TransToolbar";
import {defaultLanguage, defaultSubtitle} from "../utils/config";
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
    const [video, setVideo] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
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
    const resetSegmentsRef = useRef(null)
    const isFromTimelineWindowRef = useRef(false)
    const handleKeyDown = useCallback((event) => {
        if ((event.code === 'Space' && event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'VIDEO' && event.target.tagName !== 'INPUT') || event.key === 'F6') {
            event.preventDefault();
            if (playerRef.current.getInternalPlayer()?.paused) playerRef.current.getInternalPlayer().play()
            else playerRef.current.getInternalPlayer()?.pause()
        }
        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            findButtonRef.current.click()
        }
        if (event.key === 'F9') {
            event.preventDefault();
            tcIoButtonRef.current.click()
        }
        if (event.key === 'F10') {
            event.preventDefault();
            tcInButtonRef.current.click()
        }
        if (event.key === 'F11') {
            event.preventDefault();
            tcOutButtonRef.current.click()
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            splitLineButtonRef.current.click()
        }
        if (event.shiftKey && event.key === 'F12') {
            event.preventDefault();
            mergeLineButtonRef.current.click()
        }
        if (event.shiftKey && event.key === '<') {
            const internalPlayer = playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = Math.max(internalPlayer.playbackRate - 0.25, 0.25)
        }
        if (event.shiftKey && event.key === '>') {
            const internalPlayer = playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = Math.min(internalPlayer.playbackRate + 0.25, 2)
        }
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
                if (start && end && start <= end) segments.push(createSegment(start, end, value.rowId))
            })
        } else {
            fnRef.current.forEach((value) => {
                const [start, end] = [tcToSec(value.start), tcToSec(value.end)]
                if (start && end && start <= end) segments.push(createSegment(start, end, value.rowId))
            })
        }
        return segments
    }, [fnToggle])
    useEffect(() => {
        resetSegmentsRef.current = resetSegments
    }, [resetSegments])
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);
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
    }, [fnToggle])
    useEffect(() => {
        if (languageFile) {
            if (languageFile.fnLanguage && languageFile.fn) { // fspx
                cellDataRef.current = languageFile.subtitle.map(v => {
                    return {...v, rowId: v.rowId || v4()}
                })
                fnRef.current = languageFile.fn.map(v => {
                    return {...v, rowId: v.rowId || v4()}
                })
                localStorage.setItem('subtitle', JSON.stringify(cellDataRef.current))
                localStorage.setItem('fn', JSON.stringify(fnRef.current))
                setLanguages(languageFile.language)
                setFnLanguages(languageFile.fnLanguage)
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
                    timelineWindowHeight: LanguageTimelineSplitterRef.current.paneNotPrimary.div.offsetHeight
                })
            }
        });
        observer.observe(rightRef.current);
        return () => observer.disconnect()
    }, []);
    return <>
        <Dropzone dropzoneRef={dropzoneRef} setMediaFile={setMediaFile} setLanguageFile={setLanguageFile}
                  fnToggleRef={fnToggleRef} languages={languages} fnLanguages={fnLanguages}/>
        <FileUploadModal fileUploadModalShow={fileUploadModalShow} setFileUploadModalShow={setFileUploadModalShow}
                         fnToggleRef={fnToggleRef} cellDataRef={cellDataRef} fnRef={fnRef} languageFile={languageFile}
                         setLanguages={setLanguages} setFnLanguages={setFnLanguages} waveformRef={waveformRef}
                         resetSegments={resetSegments}/>
        <MenuToolbar cellDataRef={cellDataRef} fnRef={fnRef} languages={languages} setLanguages={setLanguages}
                     fnLanguages={fnLanguages} setFnLanguages={setFnLanguages} hotRef={hotRef}
                     setLanguageFile={setLanguageFile} waveformRef={waveformRef}/>
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
                                         mediaFile={mediaFile} video={video} setVideo={setVideo}
                                         afterRenderPromise={afterRenderPromise}/>
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
                                      findButtonRef={findButtonRef} afterRenderPromise={afterRenderPromise}
                                      languages={languages} setLanguages={setLanguages}
                                      fnLanguages={fnLanguages} setFnLanguages={setFnLanguages}/>
                        <Splitter ref={LanguageTimelineSplitterRef} position={'horizontal'}
                                  primaryPaneHeight={'calc(100% - 300px)'}
                                  onDragFinished={() => {
                                      setRightRefSize({
                                          ...rightRefSize,
                                          languageWindowHeight: LanguageTimelineSplitterRef.current.panePrimary.div.offsetHeight,
                                          timelineWindowHeight: LanguageTimelineSplitterRef.current.paneNotPrimary.div.offsetHeight
                                      })
                                  }}>
                            <LanguageWindow size={rightRefSize} hotRef={hotRef} playerRef={playerRef}
                                            hotFontSize={hotFontSize} hotSelectionRef={hotSelectionRef}
                                            waveformRef={waveformRef} fnToggle={fnToggle}
                                            cellDataRef={cellDataRef} languages={languages}
                                            isFromTimelineWindowRef={isFromTimelineWindowRef}
                                            fnRef={fnRef} fnLanguages={fnLanguages}/>
                            <TimelineWindow size={rightRefSize} resetSegments={resetSegments} hotRef={hotRef}
                                            isFromTimelineWindowRef={isFromTimelineWindowRef}
                                            waveformRef={waveformRef} mediaFile={mediaFile} video={video}/>
                        </Splitter>
                    </div>
                </Splitter>
            </div>
        </div>
    </>
};

export default Production
