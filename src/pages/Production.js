import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import {setDropzone} from "../utils/setDropzone";
import Splitter from "m-react-splitters";
import "../css/Splitter.css"
import TransToolbar from "../components/production/TransToolbar";
import {defaultLanguage, defaultSubtitle} from "../utils/config";

const Production = () => {
    const dropzoneRef = useRef(null)
    const rightRef = useRef(null)
    const [rightRefSize, setRightRefSize] = useState({width: 0, height: 0})
    const [mediaFile, setMediaFile] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const playerRef = useRef(null)
    const isVideoSeeking = useRef(false)
    const waveformRef = useRef(null)
    const isWaveSeeking = useRef(false)
    const cellDataRef = useRef(localStorage.subtitle ? JSON.parse(localStorage.subtitle) : defaultSubtitle)
    const fxRef = useRef(localStorage.fx ? JSON.parse(localStorage.fx) : defaultSubtitle)
    const [languages, setLanguages] = useState(localStorage.language ? JSON.parse(localStorage.language) : defaultLanguage)
    const hotRef = useRef(null)
    const hotSelectionRef = useRef({rowStart: null, columnStart: null, rowEnd: null, columnEnd: null})
    const [hotFontSize, setHotFontSize] = useState('13px')
    const [fxToggle, setFxToggle] = useState(false)
    const tcIoButtonRef = useRef(null)
    const tcInButtonRef = useRef(null)
    const tcOutButtonRef = useRef(null)
    const splitLineButtonRef = useRef(null)
    const mergeLineButtonRef = useRef(null)
    const handleKeyDown = useCallback((event) => {
        if ((event.code === 'Space' && event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'VIDEO') || event.key === 'F6') {
            event.preventDefault();
            if (playerRef.current.getInternalPlayer()?.paused) playerRef.current.getInternalPlayer().play()
            else playerRef.current.getInternalPlayer()?.pause()
        }
        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            console.log('find')
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
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);
    useEffect(() => {
        setDropzone({
            element: dropzoneRef.current, setMediaFile: (value) => {
                setMediaFile(value)
            }, setLanguageFile: (value) => {
                setLanguageFile(value)
            }
        })
    }, [dropzoneRef])
    useEffect(() => {
        localStorage.setItem('language', JSON.stringify(languages))
    }, [languages])
    useEffect(() => {
        if (languageFile) {
            if (languageFile.fx) {
                fxRef.current = languageFile.fx
                localStorage.setItem('fx', JSON.stringify(languageFile.fx))
            }
            cellDataRef.current = languageFile.subtitle
            localStorage.setItem('subtitle', JSON.stringify(languageFile.subtitle))
            setLanguages(languageFile.language)
        }
    }, [languageFile])
    useEffect(() => {
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const {width, height} = entry.contentRect;
                setRightRefSize({width: width, height: height})
            }
        });
        observer.observe(rightRef.current);
        return () => observer.disconnect()
    }, []);
    return <>
        <MenuToolbar cellDataRef={cellDataRef} fxRef={fxRef} languages={languages} setLanguages={setLanguages} hotRef={hotRef}/>
        <div ref={dropzoneRef} style={{
            flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px',
            width: '100vw', height: 'calc(100vh - 100px)', position: 'relative'
        }}>
            <div id={'splitter-wrapper'} style={{width: '100%', height: '100%', position: 'relative'}}>
                <Splitter position={'vertical'} primaryPaneWidth={'500px'}
                          primaryPaneMaxWidth={'100%'} primaryPaneMinWidth={0}>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
                        <Splitter position={'horizontal'} primaryPaneHeight={'30%'}>
                            <MediaWindow cellDataRef={cellDataRef} fxRef={fxRef} languages={languages} hotRef={hotRef}
                                         fxToggle={fxToggle}
                                         playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile}
                                         isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                            <InformationWindow/>
                        </Splitter>
                    </div>
                    <div ref={rightRef} style={{
                        flexDirection: 'column', display: 'flex', width: '100%', height: '100%',
                        borderStyle: 'solid', borderWidth: 'thin'
                    }}>
                        <TransToolbar setHotFontSize={setHotFontSize} playerRef={playerRef}
                                      fxToggle={fxToggle} setFxToggle={setFxToggle}
                                      hotRef={hotRef} hotSelectionRef={hotSelectionRef} tcIoButtonRef={tcIoButtonRef}
                                      tcInButtonRef={tcInButtonRef} tcOutButtonRef={tcOutButtonRef}
                                      splitLineButtonRef={splitLineButtonRef} mergeLineButtonRef={mergeLineButtonRef}
                                      languages={languages} setLanguages={setLanguages}/>
                        <LanguageWindow size={rightRefSize} hotRef={hotRef} playerRef={playerRef}
                                        hotFontSize={hotFontSize} hotSelectionRef={hotSelectionRef}
                                        cellDataRef={cellDataRef} languages={languages}
                                        fxToggle={fxToggle} fxRef={fxRef}/>
                        <div style={{width: '100%', borderTop: 'solid', borderWidth: 'thin'}}/>
                        <TimelineWindow size={rightRefSize}
                                        waveformRef={waveformRef} playerRef={playerRef} mediaFile={mediaFile}
                                        isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                    </div>
                </Splitter>
            </div>
        </div>
    </>
};

export default Production
