import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useCallback, useEffect, useRef, useState} from "react";
import {setDropzone} from "../utils/setDropzone";
import Splitter from "m-react-splitters";
import "../css/Splitter.css"
import {MDBBtn, MDBInput, MDBTooltip} from "mdb-react-ui-kit";
import LanguagesModal from "../components/production/modals/LanguagesModal";
import {TbArrowsJoin2, TbArrowsSplit2} from "react-icons/tb";

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
    const [hotFontSize, SetHotFontSize] = useState('13px')
    const isVideoSeeking = useRef(false)
    const isWaveSeeking = useRef(false)
    const handleKeyDown = useCallback((event) => {
        if (event.code === 'Space' && event.target.tagName !== 'TEXTAREA') {
            if (playerRef.current.getInternalPlayer()?.paused) playerRef.current.getInternalPlayer().play()
            else playerRef.current.getInternalPlayer()?.pause()
        }
    }, [])
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
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
                        <div style={{
                            flexDirection: 'row', display: 'flex', alignItems: 'center', height: '40px'
                        }}>
                            <MDBInput wrapperStyle={{marginLeft: '5px'}} style={{width: '60px'}} size={'sm'}
                                      label='Font Size' type='number' defaultValue={13} min={10} max={25}
                                      onChange={(event) => {
                                          SetHotFontSize(Math.max(Math.min(parseInt(event.target.value), 25), 10) + 'px')
                                      }}/>
                            <LanguagesModal languages={languages} setLanguages={setLanguages}/>
                            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 나누기'>
                                <MDBBtn color="link" size={'sm'} onClick={() => {
                                    console.log('줄 나누기')
                                }} disabled><TbArrowsSplit2 size={20}/></MDBBtn>
                            </MDBTooltip>
                            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 합치기'>
                                <MDBBtn color="link" size={'sm'} onClick={() => {
                                    console.log('줄 합치기')
                                }} disabled><TbArrowsJoin2 size={20}/></MDBBtn>
                            </MDBTooltip>
                        </div>
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
