import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, tcToSec} from "../../../utils/functions";
import {MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";

let subtitleLanguage = null

const MediaWindow = ({setVideo, ...props}) => {
    const subtitleLabelRef = useRef(null)
    const curSubtitleIndexRef = useRef(-1)
    const [t] = useState(Date.now())
    const setLabel = useCallback((seconds, start, end, forceSelect, isSeek) => {
        let curIndex = curSubtitleIndexRef
        let targetIndex = props.subtitleIndexRef.current
        let nextSubtitle = props.cellDataRef.current[targetIndex][subtitleLanguage] || ''
        let labelRef = subtitleLabelRef
        const viewPortToIndex = Math.max(targetIndex - Math.round(props.hotRef.current.countVisibleRows() / 2), 0)
        if (seconds >= start && seconds <= end) {
            if (curIndex.current !== targetIndex) {
                curIndex.current = targetIndex
                if (forceSelect) {
                    !props.hotRef.current.getActiveEditor()?._opened && props.hotRef.current.selectRows(targetIndex)
                    if (document.getElementById('scrollView-checkbox').checked) props.hotRef.current.scrollViewportTo(viewPortToIndex)
                }
            } else {
                if (isSeek && forceSelect) {
                    props.hotRef.current.selectRows(targetIndex)
                    // props.hotRef.current.scrollViewportTo(viewPortToIndex)
                }
            }
            if (labelRef.current.innerHTML !== nextSubtitle) labelRef.current.innerHTML = nextSubtitle.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
        } else {
            if (curIndex.current === targetIndex) {
                labelRef.current.innerHTML = ''
                curIndex.current = -1
            }
        }
    }, [props.cellDataRef, props.subtitleIndexRef, props.hotRef])

    const onSeek = useCallback((seconds) => {
        props.subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].start) !== seconds) props.subtitleIndexRef.current = Math.max(props.subtitleIndexRef.current - 1, 0)
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        setLabel(seconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), !props.isFromLanguageWindowRef.current, true)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        props.isFromLanguageWindowRef.current = false
    }, [props.cellDataRef, props.isFromLanguageWindowRef, setLabel, props.subtitleIndexRef, props.waveformRef])

    const onProgress = useCallback((state) => {
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        setLabel(state.playedSeconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), true, false)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].end)) props.subtitleIndexRef.current += 1
    }, [props.cellDataRef, setLabel, props.subtitleIndexRef, props.waveformRef])

    const onPlayPause = useCallback(() => {
        const curIndex = props.subtitleIndexRef.current
        const [start, end] = props.hotRef.current.getDataAtRow(curIndex).slice(0, 2)
        const currentTime = props.playerRef.current.getCurrentTime().toFixed(3)
        if (currentTime >= tcToSec(start) && currentTime <= tcToSec(end) && !props.hotRef.current.getActiveEditor()?._opened) props.hotRef.current.selectRows(curIndex)
    }, [props.hotRef, props.subtitleIndexRef, props.playerRef])

    const onReady = useCallback(() => {
        if (props.video !== props.mediaFile) {
            setVideo(props.mediaFile) // generate waveform after video is loaded
            curSubtitleIndexRef.current = -1
            props.subtitleIndexRef.current = 0
        }
    }, [props.mediaFile, props.video, setVideo, props.subtitleIndexRef])

    useEffect(() => {
        if (!subtitleLanguage || !props.languages.map((value) => `${value.code}_${value.counter}`).includes(subtitleLanguage)) {
            subtitleLanguage = props.languages[0] ? `${props.languages[0].code}_${props.languages[0].counter}` : null
        }
    }, [props.languages])

    useEffect(() => {
        subtitleLabelRef.current.innerHTML = ''
    }, [props.mediaFile])

    return <div
        className={'w-100 h-100 d-flex justify-content-center align-items-end position-relative overflow-hidden'}
        style={{borderStyle: 'solid', borderWidth: 'thin', backgroundColor: 'black'}} onClick={(event) => {
        const video = props.playerRef.current?.getInternalPlayer()
        if (video && event.target.tagName === 'VIDEO') video.paused ? video.readyState && video.play() : video.pause()
    }}>
        <ReactPlayer ref={props.playerRef} width={'100%'} height={'100%'} progressInterval={1} onProgress={onProgress}
                     onReady={onReady} onPlay={onPlayPause} onPause={onPlayPause} onSeek={onSeek} controls={true}
                     url={props.mediaFile?.startsWith('https://s3.subtitleqc.ai') ? `${props.mediaFile}?t=${t}` : props.mediaFile}
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
            {props.mediaInfo?.framerate && `${props.mediaInfo.framerate} fps`}</span>
        <span ref={subtitleLabelRef} className={'span-subtitle'}/>
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
        </div>
    </div>
}

export default MediaWindow
