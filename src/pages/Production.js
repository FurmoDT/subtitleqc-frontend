import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useEffect, useRef, useState} from "react";
import {setDropzone} from "../utils/setDropzone";
import Splitter from "m-react-splitters";
import "../css/Splitter.css"

const Production = () => {
    const dropzoneRef = useRef(null)
    const rightRef = useRef(null)
    const [rightRefSize, setRightRefSize] = useState({width: 0, height: 0})
    const playerRef = useRef(null)
    const waveformRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const isVideoSeeking = useRef(false)
    const isWaveSeeking = useRef(false)
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
                setRightRefSize({width: width - 10, height: height})
            }
        });
        observer.observe(rightRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);
    return <>
        <MenuToolbar/>
        <div ref={dropzoneRef}>
            <div style={{
                flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px',
                width: '100vw', height: '90vh', position: 'relative'
            }}>
                <Splitter position={'vertical'} primaryPaneWidth={'30%'}
                          primaryPaneMaxWidth={'60%'} primaryPaneMinWidth={'300px'}>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%', zIndex: 1}}>
                        <Splitter position={'horizontal'} primaryPaneHeight={'30%'}>
                            <MediaWindow playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile}
                                         isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                            <InformationWindow/>
                        </Splitter>
                    </div>
                    <div ref={rightRef}
                         style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%', zIndex: 2}}>
                        <LanguageWindow size={rightRefSize}/>
                        <TimelineWindow size={rightRefSize} waveformRef={waveformRef} playerRef={playerRef} mediaFile={mediaFile}
                                        isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                    </div>
                </Splitter>
            </div>
        </div>
    </>
};

export default Production
