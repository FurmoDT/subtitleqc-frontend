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

const Production = () => {
    const dropzoneRef = useRef(null)
    const rightRef = useRef(null)
    const [rightRefSize, setRightRefSize] = useState({width: 0, height: 0})
    const playerRef = useRef(null)
    const waveformRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const [languages, setLanguages] = useState([{code: 'other', name: '기타', counter: 1}])
    const cellDataRef = useRef(Array.from({length: 100}, () => ({})))
    const [hotFontSize, setHotFontSize] = useState('13px')
    const isVideoSeeking = useRef(false)
    const isWaveSeeking = useRef(false)
    const handleKeyDown = useCallback((event) => {
        if (event.code === 'Space' && event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'VIDEO') {
            if (playerRef.current.getInternalPlayer()?.paused) playerRef.current.getInternalPlayer().play()
            else playerRef.current.getInternalPlayer()?.pause()
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
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const {width, height} = entry.contentRect;
                setRightRefSize({width: width, height: height})
            }
        });
        observer.observe(rightRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);
    return <>
        <MenuToolbar cellDataRef={cellDataRef} languages={languages}/>
        <div ref={dropzoneRef} style={{
            flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px',
            width: '100vw', height: 'calc(100vh - 100px)', position: 'relative'
        }}>
            <div id={'splitter-wrapper'} style={{width: '100%', height: '100%', position: 'relative'}}>
                <Splitter position={'vertical'} primaryPaneWidth={'500px'}
                          primaryPaneMaxWidth={'100%'} primaryPaneMinWidth={0}>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
                        <Splitter position={'horizontal'} primaryPaneHeight={'30%'}>
                            <MediaWindow cellDataRef={cellDataRef} languages={languages}
                                         playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile}
                                         isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                            <InformationWindow/>
                        </Splitter>
                    </div>
                    <div ref={rightRef} style={{
                        flexDirection: 'column', display: 'flex', width: '100%', height: '100%',
                        borderStyle: 'solid', borderWidth: 'thin'
                    }}>
                        <TransToolbar setHotFontSize={setHotFontSize} languages={languages} setLanguages={setLanguages}/>
                        <LanguageWindow size={rightRefSize} cellDataRef={cellDataRef} hotFontSize={hotFontSize}
                                        languageFile={languageFile} languages={languages} setLanguages={setLanguages}/>
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
