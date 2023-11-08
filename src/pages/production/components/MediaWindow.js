import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, secToTc, tcToSec} from "../../../utils/functions";
import {MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";
import RangeSlider from 'react-range-slider-input';
import '../../../css/RangeSlider.css';
import {BsPauseFill, BsPlayFill} from "react-icons/bs";
import {SlSpeedometer} from "react-icons/sl";
import {HiSpeakerWave, HiSpeakerXMark} from "react-icons/hi2";

let subtitleLanguage = null

const MediaWindow = ({setVideo, ...props}) => {
    const subtitleLabelRef = useRef(null)
    const curSubtitleIndexRef = useRef(-1)
    const [t] = useState(Date.now())
    const [seek, setSeek] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const volumeRef = useRef(null)

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
        setSeek(seconds)
        props.subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].start) !== seconds) props.subtitleIndexRef.current = Math.max(props.subtitleIndexRef.current - 1, 0)
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        setLabel(seconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), !props.isFromLanguageWindowRef.current, true)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        props.isFromLanguageWindowRef.current = false
    }, [props.cellDataRef, props.isFromLanguageWindowRef, setLabel, props.subtitleIndexRef, props.waveformRef])

    const onDuration = useCallback((duration) => setDuration(duration), [])

    const onProgress = useCallback((state) => {
        setSeek(state.playedSeconds)
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        setLabel(state.playedSeconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), true, false)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].end)) props.subtitleIndexRef.current += 1
    }, [props.cellDataRef, setLabel, props.subtitleIndexRef, props.waveformRef])

    const onPlayPause = useCallback((event) => {
        setIsPlaying(event?.type !== 'pause')
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

    return <>
        <div className={'w-100 position-relative'} style={{height: 'calc(100% - 3rem)', backgroundColor: 'black'}}
             onClick={() => {
                 const video = props.playerRef.current?.getInternalPlayer()
                 if (video) isPlaying ? video.pause() : video.play()
             }}>
            <ReactPlayer ref={props.playerRef} width={'100%'} height={'100%'} progressInterval={1} muted={isMuted}
                         onProgress={onProgress} onReady={onReady} onDuration={onDuration}
                         onPlay={onPlayPause} onPause={onPlayPause} onSeek={onSeek}
                         url={props.mediaFile?.startsWith('https://s3.subtitleqc.ai') ? `${props.mediaFile}?t=${t}` : props.mediaFile}
                         config={{file: {attributes: {onContextMenu: e => e.preventDefault()}}}}/>
            <div className={'w-100 h-100 position-absolute top-0'}/>
            <span className={'span-framerate mx-1'}>
                {props.mediaInfo?.framerate && `${props.mediaInfo.framerate} fps`}</span>
            <span ref={subtitleLabelRef} className={'span-subtitle'}/>
        </div>
        <div className={'w-100 h-100'} style={{backgroundColor: 'black'}}>
            <div className={'d-flex align-items-center px-3'} style={{height: '1rem'}}>
                <RangeSlider className="single-thumb" thumbsDisabled={[true, false]} rangeSlideDisabled={true}
                             value={[0, seek]} max={duration}
                             onInput={value => props.playerRef.current.seekTo(value[1], 'seconds')}/>

            </div>
            <div className={'d-flex justify-content-between px-3'} style={{height: '2rem'}}>
                <div className={'h-100 d-flex flex-nowrap align-items-center'}>
                    {isPlaying ?
                        <BsPauseFill className={'button-icon'} size={20}
                                     onClick={event => props.playerRef.current.getInternalPlayer().pause()}/> :
                        <BsPlayFill className={'button-icon'} size={20}
                                    onClick={event => props.playerRef.current.getInternalPlayer()?.play()}/>}
                    <span className={'span-duration ms-2'}>{`${secToTc(seek)} / ${secToTc(duration)}`}</span>
                </div>
                <div className={'h-100 d-flex flex-nowrap align-items-center'}>
                    <div className={'position-relative d-flex justify-content-center me-4'}
                         onMouseEnter={() => volumeRef.current.classList.remove('d-none')}
                         onMouseLeave={() => volumeRef.current.classList.add('d-none')}>
                        {isMuted ?
                            <HiSpeakerXMark className={'button-icon'} size={20}
                                            onClick={() => {
                                                const internalPlayer = props.playerRef.current.getInternalPlayer()
                                                setIsMuted(false)
                                                if (internalPlayer) internalPlayer.muted = false
                                            }}/> :
                            <HiSpeakerWave className={'button-icon'} size={20}
                                           onClick={() => {
                                               const internalPlayer = props.playerRef.current.getInternalPlayer()
                                               setIsMuted(true)
                                               if (internalPlayer) internalPlayer.muted = true
                                           }}/>}
                        <div ref={volumeRef} className={'position-absolute'} style={{bottom: 20}}>
                            <div style={{height: '140px', padding: '20px'}}>
                                {/*TODO range slider*/}
                            </div>
                        </div>
                    </div>
                    <MDBDropdown className={'me-4'} dropup>
                        <MDBDropdownToggle className={'button-icon d-flex align-items-center custom-dropdown'}
                                           tag={'section'}>
                            <SlSpeedometer size={20}/>
                        </MDBDropdownToggle>
                        <MDBDropdownMenu style={{minWidth: '5rem', height: '10rem', overflowY: 'scroll'}}
                                         responsive={'end'}>
                            <div className={'text-center fw-bold'}>재생 속도</div>
                            {Array.from({length: (2 - 0.25) / 0.25 + 1}, (_, i) => 0.25 + 0.25 * i).map(value =>
                                <MDBDropdownItem link key={value}
                                                 onClick={() => {
                                                     const internalPlayer = props.playerRef.current.getInternalPlayer()
                                                     if (internalPlayer) internalPlayer.playbackRate = value
                                                 }}>{`${value}`}</MDBDropdownItem>)}
                        </MDBDropdownMenu>
                    </MDBDropdown>
                    <MDBDropdown dropup>
                        <MDBDropdownToggle className={'button-icon d-flex align-items-center custom-dropdown'}
                                           tag={'section'}>
                            <MDBIcon fas icon='globe'/>
                        </MDBDropdownToggle>
                        <MDBDropdownMenu style={{minWidth: '7rem'}} responsive={'end'}>
                            <div className={'text-center fw-bold'}>언어 선택</div>
                            {props.languages.filter((value) => value.code.match(/^[a-z]{2}[A-Z]{2}$/)).map(value =>
                                <MDBDropdownItem link key={`${value.code}_${value.counter}`} onClick={() => {
                                    subtitleLanguage = `${value.code}_${value.counter}`
                                    if (props.playerRef.current.getInternalPlayer()?.paused) props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds')
                                }}>{value.name}</MDBDropdownItem>)}
                        </MDBDropdownMenu>
                    </MDBDropdown>
                </div>
            </div>
        </div>
    </>
}

export default MediaWindow
