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
    return <>
        <MenuToolbar/>
        <div ref={dropzoneRef}>
            <div style={{
                flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px', height: '90vh'
            }}>
                <Splitter position={'vertical'} primaryPaneWidth={'30%'}
                          primaryPaneMaxWidth={'60%'} primaryPaneMinWidth={'300px'}>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
                        <Splitter position={'horizontal'} primaryPaneHeight={'30%'}>
                            <MediaWindow playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile}
                                         isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                            <InformationWindow/>
                        </Splitter>
                    </div>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
                        <LanguageWindow/>
                        <TimelineWindow waveformRef={waveformRef} playerRef={playerRef} mediaFile={mediaFile}
                                        isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                    </div>
                </Splitter>
            </div>
        </div>
    </>
};

export default Production
