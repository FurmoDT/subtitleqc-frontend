import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, tcToSec} from "../../utils/functions";
import {MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";

let subtitleLanguage = null
let fxLanguage = null
let curSubtitleIndex = -1
let curFxIndex = -1

const MediaWindow = (props) => {
    const [showFx, setShowFx] = useState(false)
    const subtitleLabelRef = useRef(null)
    const fxLabelRef = useRef(null)
    const subtitleIndexRef = useRef(0)
    const fxIndexRef = useRef(0)
    const setVideo = props.setVideo
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
                if (!props.fxToggle) setTdColor(subtitleIndexRef.current, true)
            }
            if (subtitleLabelRef.current.innerText !== nextSubtitle) subtitleLabelRef.current.innerText = nextSubtitle
        } else {
            if (curSubtitleIndex === subtitleIndexRef.current) {
                subtitleLabelRef.current.innerText = ''
                curSubtitleIndex = -1
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
                curFxIndex = -1
                if (props.fxToggle) setTdColor(fxIndexRef.current, false)
            }
        }
    }, [props.fxRef, props.fxToggle, setTdColor])
    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const timeOut = setTimeout(() => {
                props.hotRef.current.removeHook('afterRender', afterRenderCallback)
                resolve()
            }, 100)
            const afterRenderCallback = (isForced) => {
                clearTimeout(timeOut)
                if (!isForced) resolve()
            }
            props.hotRef.current.addHookOnce('afterRender', afterRenderCallback)
        })
    }, [props.hotRef])
    const onSeek = useCallback((seconds) => {
        subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        fxIndexRef.current = bisect(props.fxRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[subtitleIndexRef.current].start) !== seconds) subtitleIndexRef.current = Math.max(subtitleIndexRef.current - 1, 0)
        if (tcToSec(props.fxRef.current[fxIndexRef.current].start) !== seconds) fxIndexRef.current = Math.max(fxIndexRef.current - 1, 0)
        if (!props.hotRef.current.getActiveEditor()?._opened) props.hotRef.current.scrollViewportTo(!props.fxToggle ? subtitleIndexRef.current : fxIndexRef.current, 0)
        afterRenderPromise().then(() => {
            setSubtitleLabel(seconds)
            setFxLabel(seconds)
        })
        props.hotRef.current.removeHook('afterRender')
    }, [props.cellDataRef, props.fxRef, props.hotRef, props.fxToggle, setSubtitleLabel, setFxLabel, afterRenderPromise])
    const onProgress = useCallback((state) => {
        setSubtitleLabel(state.playedSeconds)
        setFxLabel(state.playedSeconds)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[subtitleIndexRef.current].end)) subtitleIndexRef.current += 1
        if (state.playedSeconds >= tcToSec(props.fxRef.current[fxIndexRef.current].end)) fxIndexRef.current += 1
    }, [props.cellDataRef, props.fxRef, setSubtitleLabel, setFxLabel])
    const onReady = useCallback(() => {
        if (props.video !== props.mediaFile) setVideo(props.mediaFile)
    }, [props.mediaFile, props.video, setVideo])
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
                     controls={true} progressInterval={1} url={props.mediaFile} onSeek={onSeek} onProgress={onProgress}
                     onReady={onReady}
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
