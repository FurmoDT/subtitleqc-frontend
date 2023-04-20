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
    const setVideo = props.setVideo
    const afterRenderPromise = props.afterRenderPromise
    const setSubtitleLabel = useCallback((seconds, start, end, select) => {
        if (seconds >= start && seconds <= end) {
            const nextSubtitle = props.cellDataRef.current[props.subtitleIndexRef.current][subtitleLanguage] || ''
            if (curSubtitleIndex !== props.subtitleIndexRef.current) {
                curSubtitleIndex = props.subtitleIndexRef.current
                if (!props.fnToggle && select) {
                    props.hotRef.current.selectRows(props.subtitleIndexRef.current)
                    if (document.getElementById('scrollView-checkbox').checked) props.hotRef.current.scrollViewportTo(Math.max(props.subtitleIndexRef.current - Math.round(props.hotRef.current.countVisibleRows() / 2), 0))
                }
            }
            if (subtitleLabelRef.current.innerHTML !== nextSubtitle) subtitleLabelRef.current.innerHTML = nextSubtitle.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
        } else {
            if (curSubtitleIndex === props.subtitleIndexRef.current) {
                subtitleLabelRef.current.innerHTML = ''
                curSubtitleIndex = -1
            }
        }
    }, [props.cellDataRef, props.fnToggle, props.subtitleIndexRef, props.hotRef])
    const setFnLabel = useCallback((seconds, start, end, select) => {
        if (seconds >= start && seconds <= end) {
            const nextSubtitle = props.fnRef.current[props.fnIndexRef.current][fnLanguage] || ''
            if (curFnIndex !== props.fnIndexRef.current) {
                curFnIndex = props.fnIndexRef.current
                if (props.fnToggle && select) {
                    props.hotRef.current.selectRows(props.fnIndexRef.current)
                    if (document.getElementById('scrollView-checkbox').checked) props.hotRef.current.scrollViewportTo(Math.max(props.fnIndexRef.current - Math.round(props.hotRef.current.countVisibleRows() / 2), 0))
                }
            }
            if (fnLabelRef.current.innerHTML !== nextSubtitle) fnLabelRef.current.innerHTML = nextSubtitle.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
        } else {
            if (curFnIndex === props.fnIndexRef.current) {
                fnLabelRef.current.innerHTML = ''
                curFnIndex = -1
            }
        }
    }, [props.fnRef, props.fnToggle, props.fnIndexRef, props.hotRef])
    const onSeek = useCallback((seconds) => {
        props.subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        props.fnIndexRef.current = bisect(props.fnRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].start) !== seconds) props.subtitleIndexRef.current = Math.max(props.subtitleIndexRef.current - 1, 0)
        if (tcToSec(props.fnRef.current[props.fnIndexRef.current].start) !== seconds) props.fnIndexRef.current = Math.max(props.fnIndexRef.current - 1, 0)
        if (!props.hotRef.current.getActiveEditor()?._opened && !props.isFromLanguageWindowRef.current) props.hotRef.current.scrollViewportTo((!props.fnToggle ? props.subtitleIndexRef.current : props.fnIndexRef.current) - Math.round(props.hotRef.current.countVisibleRows() / 2), 0)
        const select = !props.isFromLanguageWindowRef.current
        afterRenderPromise().then(() => {
            const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
            const {start: fnStart, end: fnEnd} = props.fnRef.current[props.fnIndexRef.current]
            setSubtitleLabel(seconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), select)
            setFnLabel(seconds, tcToSec(fnStart), tcToSec(fnEnd), select)
            if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        })
        props.isFromLanguageWindowRef.current = false
    }, [props.cellDataRef, props.fnRef, props.hotRef, props.fnToggle, props.isFromLanguageWindowRef, setSubtitleLabel, setFnLabel, props.subtitleIndexRef, props.fnIndexRef, afterRenderPromise, props.waveformRef])
    const onProgress = useCallback((state) => {
            const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
            const {start: fnStart, end: fnEnd} = props.fnRef.current[props.fnIndexRef.current]
            setSubtitleLabel(state.playedSeconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), true)
            setFnLabel(state.playedSeconds, tcToSec(fnStart), tcToSec(fnEnd), true)
            if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
            if (state.playedSeconds >= tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].end)) props.subtitleIndexRef.current += 1
            if (state.playedSeconds >= tcToSec(props.fnRef.current[props.fnIndexRef.current].end)) props.fnIndexRef.current += 1
        }, [props.cellDataRef, props.fnRef, setSubtitleLabel, setFnLabel, props.subtitleIndexRef, props.fnIndexRef, props.waveformRef]
    )
    const onReady = useCallback(() => {
        if (props.video !== props.mediaFile) {
            setVideo(props.mediaFile) // generate waveform after video is loaded
            curSubtitleIndex = -1
            curFnIndex = -1
            props.subtitleIndexRef.current = 0
            props.fnIndexRef.current = 0
        }
    }, [props.mediaFile, props.video, setVideo, props.subtitleIndexRef, props.fnIndexRef])
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
    useEffect(() => {
        subtitleLabelRef.current.innerHTML = ''
        fnLabelRef.current.innerHTML = ''
    }, [props.mediaFile])
    return <div style={{
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'end',
        display: 'flex',
        borderStyle: 'solid',
        borderWidth: 'thin'
    }} onClick={(event) => {
        const video = props.playerRef.current?.getInternalPlayer()
        if (video && event.target.tagName === 'VIDEO') video.paused ? video.play() : video.pause()
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile} onSeek={onSeek} onProgress={onProgress}
                     onReady={onReady}
                     config={{
                         file: {
                             attributes: {
                                 controlsList: 'nodownload nofullscreen',
                                 disablePictureInPicture: true
                             }
                         }
                     }}/>
        <label style={{
            position: 'absolute', color: 'white', pointerEvents: 'none', top: 0, left: 0, fontSize: 13,
            marginLeft: 5
        }}>{props.mediaInfo?.media?.track?.filter((value) => value['@type'] === 'General')[0]?.FrameRate}{'fps'}</label>
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
                            if (props.playerRef.current.getInternalPlayer()?.paused) props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds')
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
                                if (props.playerRef.current.getInternalPlayer()?.paused) props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds')
                            }}>{value.name}</MDBDropdownItem>
                        })}
                    </MDBDropdownMenu>
                </MDBDropdown>
            </div>
        </div>
    </div>
}

export default MediaWindow
