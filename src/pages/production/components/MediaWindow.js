import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, tcToSec} from "../../../utils/functions";
import {MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";

let subtitleLanguage = null
let fnLanguage = null

const MediaWindow = (props) => {
    const [showFn, setShowFn] = useState(false)
    const subtitleLabelRef = useRef(null)
    const fnLabelRef = useRef(null)
    const curSubtitleIndexRef = useRef(-1)
    const curFnIndexRef = useRef(-1)
    const setVideo = props.setVideo
    const setLabel = useCallback((seconds, start, end, isSubtitle, forceSelect, isSeek) => {
        let curIndex, targetIndex, nextSubtitle, labelRef
        if (isSubtitle) {
            curIndex = curSubtitleIndexRef
            targetIndex = props.subtitleIndexRef.current
            nextSubtitle = props.cellDataRef.current[targetIndex][subtitleLanguage] || ''
            labelRef = subtitleLabelRef
        } else {
            curIndex = curFnIndexRef
            targetIndex = props.fnIndexRef.current
            nextSubtitle = props.fnRef.current[targetIndex][fnLanguage] || ''
            labelRef = fnLabelRef
        }
        const viewPortToIndex = Math.max(targetIndex - Math.round(props.hotRef.current.countVisibleRows() / 2), 0)
        if (seconds >= start && seconds <= end) {
            if (curIndex.current !== targetIndex) {
                curIndex.current = targetIndex
                if (props.fnToggle ^ isSubtitle && forceSelect) {
                    props.hotRef.current.selectRows(targetIndex)
                    if (document.getElementById('scrollView-checkbox').checked) props.hotRef.current.scrollViewportTo(viewPortToIndex)
                }
            } else {
                if (isSeek && props.fnToggle ^ isSubtitle && forceSelect) {
                    props.hotRef.current.selectRows(targetIndex)
                    props.hotRef.current.scrollViewportTo(viewPortToIndex)
                }
            }
            if (labelRef.current.innerHTML !== nextSubtitle) labelRef.current.innerHTML = nextSubtitle.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
        } else {
            if (curIndex.current === targetIndex) {
                labelRef.current.innerHTML = ''
                curIndex.current = -1
            }
        }
    }, [props.cellDataRef, props.fnRef, props.fnToggle, props.subtitleIndexRef, props.fnIndexRef, props.hotRef])
    const onSeek = useCallback((seconds) => {
        props.subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        props.fnIndexRef.current = bisect(props.fnRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].start) !== seconds) props.subtitleIndexRef.current = Math.max(props.subtitleIndexRef.current - 1, 0)
        if (tcToSec(props.fnRef.current[props.fnIndexRef.current].start) !== seconds) props.fnIndexRef.current = Math.max(props.fnIndexRef.current - 1, 0)
        const select = !props.isFromLanguageWindowRef.current
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        const {start: fnStart, end: fnEnd} = props.fnRef.current[props.fnIndexRef.current]
        setLabel(seconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), true, select, true)
        setLabel(seconds, tcToSec(fnStart), tcToSec(fnEnd), false, select, true)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        props.isFromLanguageWindowRef.current = false
    }, [props.cellDataRef, props.fnRef, props.isFromLanguageWindowRef, setLabel, props.subtitleIndexRef, props.fnIndexRef, props.waveformRef])
    const onProgress = useCallback((state) => {
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        const {start: fnStart, end: fnEnd} = props.fnRef.current[props.fnIndexRef.current]
        setLabel(state.playedSeconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), true, true, false)
        setLabel(state.playedSeconds, tcToSec(fnStart), tcToSec(fnEnd), false, true, false)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].end)) props.subtitleIndexRef.current += 1
        if (state.playedSeconds >= tcToSec(props.fnRef.current[props.fnIndexRef.current].end)) props.fnIndexRef.current += 1
    }, [props.cellDataRef, props.fnRef, setLabel, props.subtitleIndexRef, props.fnIndexRef, props.waveformRef])
    const onPlayPause = useCallback(() => {
        const curIndex = !props.fnToggle ? props.subtitleIndexRef.current : props.fnIndexRef.current
        const [start, end] = props.hotRef.current.getDataAtRow(curIndex).slice(0, 2)
        const currentTime = props.playerRef.current.getCurrentTime().toFixed(3)
        if (currentTime >= tcToSec(start) && currentTime <= tcToSec(end)) props.hotRef.current.selectRows(curIndex)
    }, [props.hotRef, props.fnToggle, props.subtitleIndexRef, props.fnIndexRef, props.playerRef])
    const onReady = useCallback(() => {
        if (props.video !== props.mediaFile) {
            setVideo(props.mediaFile) // generate waveform after video is loaded
            curSubtitleIndexRef.current = -1
            curFnIndexRef.current = -1
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
    return <div
        className={'w-100 h-100 d-flex justify-content-center align-items-end position-relative overflow-hidden'}
        style={{borderStyle: 'solid', borderWidth: 'thin'}} onClick={(event) => {
        const video = props.playerRef.current?.getInternalPlayer()
        if (video && event.target.tagName === 'VIDEO') video.paused ? video.play() : video.pause()
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile} onSeek={onSeek} onProgress={onProgress}
                     onReady={onReady} onPlay={onPlayPause} onPause={onPlayPause}
                     config={{
                         file: {
                             attributes: {
                                 controlsList: 'nodownload nofullscreen',
                                 disablePictureInPicture: true,
                                 onContextMenu: e => e.preventDefault()
                             }
                         }
                     }}/>
        <span className={'position-absolute pe-none top-0 start-0 ms-1'} style={{color: 'white', fontSize: '0.8rem'}}>
            {`${props.mediaInfo?.framerate} fps`}</span>
        <label ref={fnLabelRef} className={'position-absolute pe-none top-0'}
               style={{color: 'white', whiteSpace: 'pre'}}/>
        <label ref={subtitleLabelRef} className={'position-absolute pe-none'}
               style={{color: 'white', whiteSpace: 'pre'}}/>
        <div className={'position-absolute top-0 end-0'}>
            <MDBDropdown className={'d-flex justify-content-end'}>
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
            <div className="form-check d-flex align-items-center">
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
