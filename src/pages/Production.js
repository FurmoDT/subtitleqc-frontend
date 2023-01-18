import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useEffect, useRef, useState} from "react";
import {setDropzone} from "../utils/setDropzone";

const Production = () => {
    const dropzoneRef = useRef(null)
    const playerRef = useRef(null)
    const waveformRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
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
            <div style={{flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div style={{flexDirection: 'column', display: 'flex'}}>
                        <MediaWindow playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile}/>
                        <InformationWindow/>
                    </div>
                    <div style={{flexDirection: 'column', display: 'flex'}}>
                        <LanguageWindow/>
                        <TimelineWindow waveformRef={waveformRef} playerRef={playerRef} mediaFile={mediaFile}/>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default Production
