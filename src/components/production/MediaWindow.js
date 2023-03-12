import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, tcToSec} from "../../utils/functions";
import {MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";

let subtitleLanguage = null
let fnLanguage = null
let curSubtitleIndex = -1
let curFnIndex = -1

const MediaWindow = (props) => {
    const [showFn, setShowFn] = useState(false)
    const subtitleLabelRef = useRef(null)
    const fnLabelRef = useRef(null)
    const subtitleIndexRef = useRef(0)
    const fnIndexRef = useRef(0)
    const setVideo = props.setVideo
    const afterRenderPromise = props.afterRenderPromise
    const setTdColor = useCallback((index, isShow) => {
        props.hotRef.current.getCell(index, 0)?.parentElement.querySelectorAll('td').forEach(tdElement => {
            if (isShow) tdElement.style.backgroundColor = tdElement.style.backgroundColor || 'beige'
            else tdElement.style.backgroundColor = ''
        });
    }, [props.hotRef])
    const setSubtitleLabel = useCallback((seconds) => {
        const row = props.cellDataRef.current[subtitleIndexRef.current]
        if (seconds >= tcToSec(row.start) && seconds <= tcToSec(row.end)) {
            const nextSubtitle = props.cellDataRef.current[subtitleIndexRef.current][subtitleLanguage] || ''
            if (curSubtitleIndex !== subtitleIndexRef.current) {
                curSubtitleIndex = subtitleIndexRef.current
                if (!props.fnToggle) {
                    if (document.getElementById('scrollViewCheckBox').checked) props.hotRef.current.scrollViewportTo(subtitleIndexRef.current)
                    afterRenderPromise().then(() => {
                        setTdColor(subtitleIndexRef.current, true)
                    })
                }
            }
            if (subtitleLabelRef.current.innerText !== nextSubtitle) subtitleLabelRef.current.innerText = nextSubtitle
        } else {
            if (curSubtitleIndex === subtitleIndexRef.current) {
                subtitleLabelRef.current.innerText = ''
                curSubtitleIndex = -1
                if (!props.fnToggle) {
                    setTdColor(subtitleIndexRef.current, false)
                }
            }
        }
    }, [props.cellDataRef, props.fnToggle, setTdColor, afterRenderPromise, props.hotRef, props.waveformRef])
    const setFnLabel = useCallback((seconds) => {
        const row = props.fnRef.current[fnIndexRef.current]
        if (seconds >= tcToSec(row.start) && seconds <= tcToSec(row.end)) {
            const nextSubtitle = props.fnRef.current[fnIndexRef.current][fnLanguage] || ''
            if (curFnIndex !== fnIndexRef.current) {
                curFnIndex = fnIndexRef.current
                if (props.fnToggle) {
                    if (document.getElementById('scrollViewCheckBox').checked) props.hotRef.current.scrollViewportTo(fnIndexRef.current)
                    afterRenderPromise().then(() => {
                        setTdColor(fnIndexRef.current, true)
                    })
                }
            }
            if (fnLabelRef.current.innerText !== nextSubtitle) fnLabelRef.current.innerText = nextSubtitle
        } else {
            if (curFnIndex === fnIndexRef.current) {
                fnLabelRef.current.innerText = ''
                curFnIndex = -1
                if (props.fnToggle) {
                    setTdColor(fnIndexRef.current, false)
                }
            }
        }
    }, [props.fnRef, props.fnToggle, setTdColor, afterRenderPromise, props.hotRef, props.waveformRef])
    const onSeek = useCallback((seconds) => {
        subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        fnIndexRef.current = bisect(props.fnRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[subtitleIndexRef.current].start) !== seconds) subtitleIndexRef.current = Math.max(subtitleIndexRef.current - 1, 0)
        if (tcToSec(props.fnRef.current[fnIndexRef.current].start) !== seconds) fnIndexRef.current = Math.max(fnIndexRef.current - 1, 0)
        if (!props.hotRef.current.getActiveEditor()?._opened) props.hotRef.current.scrollViewportTo(!props.fnToggle ? subtitleIndexRef.current : fnIndexRef.current, 0)
        afterRenderPromise().then(() => {
            setSubtitleLabel(seconds)
            setFnLabel(seconds)
        })
    }, [props.cellDataRef, props.fnRef, props.hotRef, props.fnToggle, setSubtitleLabel, setFnLabel, afterRenderPromise])
    const onProgress = useCallback((state) => {
        setSubtitleLabel(state.playedSeconds)
        setFnLabel(state.playedSeconds)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[subtitleIndexRef.current].end)) subtitleIndexRef.current += 1
        if (state.playedSeconds >= tcToSec(props.fnRef.current[fnIndexRef.current].end)) fnIndexRef.current += 1
    }, [props.cellDataRef, props.fnRef, setSubtitleLabel, setFnLabel])
    const onReady = useCallback(() => {
        if (props.video !== props.mediaFile) setVideo(props.mediaFile) // generate waveform after video is loaded
        curSubtitleIndex = -1
        curFnIndex = -1
        subtitleIndexRef.current = 0
        fnIndexRef.current = 0
    }, [props.mediaFile, props.video, setVideo])
    useEffect(() => {
        fnLabelRef.current.style.display = showFn ? '' : 'none'
    }, [showFn])
    useEffect(() => {
        if (!subtitleLanguage || !props.languages.map((value) => `${value.code}_${value.counter}`).includes(subtitleLanguage)) {
            subtitleLanguage = props.languages[0] ? `${props.languages[0].code}_${props.languages[0].counter}` : null
        }
    }, [props.languages])
    useEffect(() => {
        if (!fnLanguage || !props.fnLanguages.map((value) => `${value.code}_${value.counter}`).includes(fnLanguage)) {
            fnLanguage = props.fnLanguages[0] ? `${props.fnLanguages[0].code}_${props.fnLanguages[0].counter}` : null
        }
    }, [props.fnLanguages])
    return <div style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'end',
        display: 'flex',
        borderStyle: 'solid',
        borderWidth: 'thin'
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile} onSeek={onSeek} onProgress={onProgress}
                     onReady={onReady}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label ref={fnLabelRef}
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
                    {props.languages.filter((value) => value.code.match(/^[a-z]{2}[A-Z]{2}$/)).map((value) => {
                        return <MDBDropdownItem link key={`${value.code}_${value.counter}`} onClick={() => {
                            subtitleLanguage = `${value.code}_${value.counter}`
                            if (props.playerRef.current.getInternalPlayer()?.paused) setSubtitleLabel(props.playerRef.current.getCurrentTime())
                        }}>{value.name}</MDBDropdownItem>
                    })}
                </MDBDropdownMenu>
            </MDBDropdown>
            <div className="form-check" style={{display: 'flex', alignItems: 'center'}}>
                <input className="form-check-input" type="checkbox" id="fnSwitch" onChange={(event) => {
                    setShowFn(event.target.checked)
                }}/>
                <label className="form-check-label" style={{color: 'white'}} htmlFor="fnSwitch">FN</label>
                <MDBDropdown>
                    <MDBDropdownToggle color={'link'}>
                        <MDBBtn tag='a' color={'none'}>
                            <MDBIcon fas icon='globe' color={'white'} size={'lg'}/>
                        </MDBBtn>
                    </MDBDropdownToggle>
                    <MDBDropdownMenu>
                        {props.fnLanguages.filter((value) => value.code.match(/^[a-z]{2}[A-Z]{2}$/)).map((value) => {
                            return <MDBDropdownItem link key={`${value.code}_${value.counter}`} onClick={() => {
                                fnLanguage = `${value.code}_${value.counter}`
                                if (props.playerRef.current.getInternalPlayer()?.paused) setFnLabel(props.playerRef.current.getCurrentTime())
                            }}>{value.name}</MDBDropdownItem>
                        })}
                    </MDBDropdownMenu>
                </MDBDropdown>
            </div>
        </div>
    </div>
};

export default MediaWindow
