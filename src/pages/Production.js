import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useEffect, useRef, useState} from "react";
import {setDropzone} from "../utils/setDropzone";
import Splitter from "m-react-splitters";
import "../css/Splitter.css"
import {MDBInput} from "mdb-react-ui-kit";

const Production = () => {
    const dropzoneRef = useRef(null)
    const rightRef = useRef(null)
    const [rightRefSize, setRightRefSize] = useState({width: 0, height: 0})
    const playerRef = useRef(null)
    const waveformRef = useRef(null)
    const [mediaFile, setMediaFile] = useState(null)
    const [languageFile, setLanguageFile] = useState(null)
    const cellDataRef = useRef(Array.from({ length: 100 }, () => ({})))
    const [hotFontSize, SetHotFontSize] = useState('13px')
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
                setRightRefSize({width: width, height: height})
            }
        });
        observer.observe(rightRef.current);
        return () => {
            observer.disconnect();
        };
    }, []);
    return <>
        <MenuToolbar/>
        <div ref={dropzoneRef} style={{
            flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px',
            width: '100vw', height: 'calc(100vh - 100px)', position: 'relative'
        }}>
            <div id={'splitter-wrapper'} style={{width: '100%', height: '100%', position: 'relative'}}>
                <Splitter position={'vertical'} primaryPaneWidth={'500px'}
                          primaryPaneMaxWidth={'100%'} primaryPaneMinWidth={0}>
                    <div style={{flexDirection: 'column', display: 'flex', width: '100%', height: '100%'}}>
                        <Splitter position={'horizontal'} primaryPaneHeight={'30%'}>
                            <MediaWindow playerRef={playerRef} waveformRef={waveformRef} mediaFile={mediaFile}
                                         isWaveSeeking={isWaveSeeking} isVideoSeeking={isVideoSeeking}/>
                            <InformationWindow/>
                        </Splitter>
                    </div>
                    <div ref={rightRef} style={{
                        flexDirection: 'column', display: 'flex', width: '100%', height: '100%',
                        borderStyle: 'solid', borderWidth: 'thin'
                    }}>
                        <div style={{
                            flexDirection: 'row', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            height: '40px'
                        }}>
                            <label>TransToolbar - change fontsize, languages</label>
                            <MDBInput style={{width: '60px'}} size={'sm'} label='Font Size'
                                      id='typeNumber' type='number' defaultValue={13} min={10} max={25}
                                      onChange={(event) => {
                                          SetHotFontSize(Math.max(Math.min(parseInt(event.target.value), 25), 10) + 'px')
                                      }
                                      }/>
                        </div>
                        <LanguageWindow size={rightRefSize} cellDataRef={cellDataRef} hotFontSize={hotFontSize}/>
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
