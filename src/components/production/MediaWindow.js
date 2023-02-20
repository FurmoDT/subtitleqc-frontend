import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, tcToSec} from "../../utils/functions";
import {MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";

let subtitleLanguage = null
let fxLanguage = null
let curSubtitleIndex = null
let curFxIndex = null

const MediaWindow = (props) => {
    const [showFx, setShowFx] = useState(false)
    const subtitleLabelRef = useRef(null)
    const fxLabelRef = useRef(null)
    const subtitleIndexRef = useRef(0)
    const fxIndexRef = useRef(0)
    const setTdColor = useCallback((index, isShow) => {
        props.hotRef.current.getCell(index, 0)?.parentElement.querySelectorAll('td').forEach(tdElement => {
            if (isShow) tdElement.style.backgroundColor = tdElement.style.backgroundColor || 'floralwhite'
            else tdElement.style.backgroundColor = ''
        });
    }, [props.hotRef])
    const setSubtitleLabel = useCallback((seconds) => {
        const row = props.cellDataRef.current[subtitleIndexRef.current]
        if (seconds >= tcToSec(row.start) && seconds <= tcToSec(row.end)) {
            const nextSubtitle = props.cellDataRef.current[subtitleIndexRef.current][subtitleLanguage] || ''
            if (curSubtitleIndex !== subtitleIndexRef.current) {
                curSubtitleIndex = subtitleIndexRef.current
                if (!props.fxToggle) setTdColor(subtitleIndexRef.current, true)
            }
            if (subtitleLabelRef.current.innerText !== nextSubtitle) subtitleLabelRef.current.innerText = nextSubtitle
        } else {
            if (curSubtitleIndex === subtitleIndexRef.current) {
                subtitleLabelRef.current.innerText = ''
                if (!props.fxToggle) setTdColor(subtitleIndexRef.current, false)
            }
        }
    }, [props.cellDataRef, props.fxToggle, setTdColor])
    const setFxLabel = useCallback((seconds) => {
        const row = props.fxRef.current[fxIndexRef.current]
        if (seconds >= tcToSec(row.start) && seconds <= tcToSec(row.end)) {
            const nextSubtitle = props.fxRef.current[fxIndexRef.current][fxLanguage] || ''
            if (curFxIndex !== fxIndexRef.current) {
                curFxIndex = fxIndexRef.current
                if (props.fxToggle) setTdColor(fxIndexRef.current, true)
            }
            if (fxLabelRef.current.innerText !== nextSubtitle) fxLabelRef.current.innerText = nextSubtitle
        } else {
            if (curFxIndex === fxIndexRef.current) {
                fxLabelRef.current.innerText = ''
                if (props.fxToggle) setTdColor(fxIndexRef.current, false)
            }
        }
    }, [props.fxRef, props.fxToggle, setTdColor])
    const onPlaybackRateChange = useCallback((event) => {
        if (props.waveformRef.current) {
            props.waveformRef.current.setPlaybackRate(event)
            props.waveformRef.current.seekTo(props.playerRef.current.getCurrentTime() / props.playerRef.current.getDuration())
        }
    }, [props.waveformRef, props.playerRef])
    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            props.hotRef.current.addHook('afterRender', (isForced) => {
                if (!isForced) resolve() // Resolve the promise when the afterRender callback is executed
            })
        })
    }, [props.hotRef])
    const onSeek = useCallback((seconds) => {
        subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        fxIndexRef.current = bisect(props.fxRef.current.map((value) => tcToSec(value.start)), seconds)
        if (!props.hotRef.current.getActiveEditor()?._opened) props.hotRef.current.scrollViewportTo(subtitleIndexRef.current - 1, 0)
        afterRenderPromise().then()
        if (tcToSec(props.cellDataRef.current[subtitleIndexRef.current].start) !== seconds) subtitleIndexRef.current = Math.max(subtitleIndexRef.current - 1, 0)
        if (tcToSec(props.fxRef.current[fxIndexRef.current].start) !== seconds) fxIndexRef.current = Math.max(fxIndexRef.current - 1, 0)
        setSubtitleLabel(seconds)
        setFxLabel(seconds)
        if (props.isWaveSeeking.current) {
            props.isWaveSeeking.current = false
            return
        }
        props.isVideoSeeking.current = true
        props.waveformRef.current?.seekAndCenter(props.playerRef.current.getCurrentTime() / props.playerRef.current.getDuration())
    }, [props.waveformRef, props.playerRef, props.isVideoSeeking, props.isWaveSeeking, props.cellDataRef, props.fxRef, props.hotRef, setSubtitleLabel, setFxLabel, afterRenderPromise])
    const onPause = useCallback(() => {
        props.waveformRef.current?.pause()
    }, [props.waveformRef])
    const onPlay = useCallback(() => {
        props.waveformRef.current?.play()
    }, [props.waveformRef])
    const onProgress = useCallback((state) => {
        setSubtitleLabel(state.playedSeconds)
        setFxLabel(state.playedSeconds)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[subtitleIndexRef.current].end)) subtitleIndexRef.current += 1
        if (state.playedSeconds >= tcToSec(props.fxRef.current[fxIndexRef.current].end)) fxIndexRef.current += 1
    }, [props.cellDataRef, props.fxRef, setSubtitleLabel, setFxLabel])
    useEffect(() => {
        fxLabelRef.current.style.display = showFx ? '' : 'none'
    }, [showFx])
    useEffect(() => {
        if (!subtitleLanguage || !props.languages.map((value) => `${value.code}_${value.counter}`).includes(subtitleLanguage)) {
            subtitleLanguage = props.languages[0] ? `${props.languages[0].code}_${props.languages[0].counter}` : null
        }
    }, [props.languages])
    useEffect(() => {
        if (!fxLanguage || !props.fxLanguages.map((value) => `${value.code}_${value.counter}`).includes(fxLanguage)) {
            fxLanguage = props.fxLanguages[0] ? `${props.fxLanguages[0].code}_${props.fxLanguages[0].counter}` : null
        }
    }, [props.fxLanguages])
    return <div style={{
        width: '100%', height: '100%', justifyContent: 'center', alignItems: 'end', display: 'flex',
        borderStyle: 'solid', borderWidth: 'thin'
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile} onPause={onPause} onPlay={onPlay}
                     onPlaybackRateChange={onPlaybackRateChange} onSeek={onSeek} onProgress={onProgress}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label ref={fxLabelRef}
               style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre', top: 0}}/>
        <label ref={subtitleLabelRef}
               style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre'}}/>
        <div style={{position: 'absolute', top: 0, right: 0}}>
            <MDBDropdown style={{display: 'flex', justifyContent: 'flex-end'}}>
                <MDBDropdownToggle color={'link'}>
                    <MDBBtn tag='a' color={'none'}>
                        <MDBIcon fas icon='globe' color={'white'} size={'lg'}/>
                    </MDBBtn>
                </MDBDropdownToggle>
                <MDBDropdownMenu>
                    {
                        props.languages.filter((value) => value.code.match(/^[a-z]{2}[A-Z]{2}$/)).map((value) => {
                            return <MDBDropdownItem link key={`${value.code}_${value.counter}`} onClick={() => {
                                subtitleLanguage = `${value.code}_${value.counter}`
                                if (props.playerRef.current.getInternalPlayer()?.paused) setSubtitleLabel(props.playerRef.current.getCurrentTime())
                            }}>{value.name}</MDBDropdownItem>
                        })
                    }
                </MDBDropdownMenu>
            </MDBDropdown>
            <div className="form-check" style={{display: 'flex', alignItems: 'center'}}>
                <input className="form-check-input" type="checkbox" id="fxSwitch" onChange={(event) => {
                    setShowFx(event.target.checked)
                }}/>
                <label className="form-check-label" style={{color: 'white'}} htmlFor="fxSwitch">FX</label>
                <MDBDropdown>
                    <MDBDropdownToggle color={'link'}>
                        <MDBBtn tag='a' color={'none'}>
                            <MDBIcon fas icon='globe' color={'white'} size={'lg'}/>
                        </MDBBtn>
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                        {
                            props.fxLanguages.filter((value) => value.code.match(/^[a-z]{2}[A-Z]{2}$/)).map((value) => {
                                return <MDBDropdownItem link key={`${value.code}_${value.counter}`} onClick={() => {
                                    fxLanguage = `${value.code}_${value.counter}`
                                    if (props.playerRef.current.getInternalPlayer()?.paused) setFxLabel(props.playerRef.current.getCurrentTime())
                                }}>{value.name}</MDBDropdownItem>
                            })
                        }
                    </MDBDropdownMenu>
                </MDBDropdown>
            </div>
        </div>
    </div>
};

export default MediaWindow
