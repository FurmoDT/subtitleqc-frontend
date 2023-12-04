import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef, useState} from "react";
import {bisect, secToTc, tcToSec} from "../../../utils/functions";
import {BsPauseFill, BsPlayFill} from "react-icons/bs";
import {SlSpeedometer} from "react-icons/sl";
import {HiSpeakerWave, HiSpeakerXMark} from "react-icons/hi2";
import {Direction, getTrackBackground, Range} from 'react-range';
import {OverlayScrollbarsComponent} from "overlayscrollbars-react";
import {PiGlobe} from "react-icons/pi";

const MediaWindow = ({setVideo, ...props}) => {
    const subtitleLabelRef = useRef(null)
    const curSubtitleIndexRef = useRef(-1)
    const [t] = useState(Date.now())
    const [seek, setSeek] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const volumeRef = useRef(null)
    const speedRef = useRef(null)
    const languageRef = useRef(null)
    const [volume, setVolume] = useState([1])
    const [language, setLanguage] = useState(null)
    const hideUtilTimeoutRef = useRef(null)

    const showUtilHandler = useCallback((target) => {
        [volumeRef.current, speedRef.current, languageRef.current].forEach(v => {
            if (v !== target) v.classList.add('d-none')
        })
        clearTimeout(hideUtilTimeoutRef.current)
        target.classList.remove('d-none')
    }, [])

    const hideUtilHandler = useCallback((target) => {
        clearTimeout(hideUtilTimeoutRef.current)
        hideUtilTimeoutRef.current = setTimeout(() => target.classList.add('d-none'), 2000)
    }, [])

    const setLabel = useCallback((seconds, start, end, forceSelect, isSeek) => {
        let curIndex = curSubtitleIndexRef
        let targetIndex = props.subtitleIndexRef.current
        let nextSubtitle = props.cellDataRef.current[targetIndex][language] || ''
        let labelRef = subtitleLabelRef
        const centerTargetIndex = Math.max(targetIndex - Math.round(props.hotRef.current.countVisibleRows() / 2), 0)
        if (seconds >= start && seconds <= end) {
            if (curIndex.current !== targetIndex) {
                curIndex.current = targetIndex
                if (forceSelect) {
                    !props.hotRef.current.getActiveEditor()?._opened && props.hotRef.current.selectRows(targetIndex)
                    if (document.getElementById('scrollView-checkbox').checked) props.hotRef.current.scrollViewportTo(centerTargetIndex)
                }
            } else {
                if (isSeek && forceSelect) { // change language
                    props.hotRef.current.selectRows(targetIndex)
                }
            }
            if (labelRef.current.innerHTML !== nextSubtitle) labelRef.current.innerHTML = nextSubtitle.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;').replaceAll(/&lt;i&gt;/g, '<i>').replaceAll(/&lt;\/i&gt;/g, '</i>')
        } else {
            if (curIndex.current === targetIndex) {
                labelRef.current.innerHTML = ''
                curIndex.current = -1
            } else {
                isSeek && props.hotRef.current.scrollViewportTo(document.getElementById('scrollView-checkbox').checked ? centerTargetIndex + 1 : targetIndex + 1)
            }
        }
    }, [props.cellDataRef, props.subtitleIndexRef, props.hotRef, language])

    const onSeek = useCallback((seconds) => {
        setSeek(seconds)
        props.subtitleIndexRef.current = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[props.subtitleIndexRef.current].start) !== seconds) props.subtitleIndexRef.current = Math.max(props.subtitleIndexRef.current - 1, 0)
        const {start: subtitleStart, end: subtitleEnd} = props.cellDataRef.current[props.subtitleIndexRef.current]
        setLabel(seconds, tcToSec(subtitleStart), tcToSec(subtitleEnd), !props.isFromLanguageWindowRef.current, true)
        if (document.getElementById('playheadCenter-checkbox').checked) props.waveformRef.current?.views.getView('zoomview').updateWaveform(props.waveformRef.current?.views.getView('zoomview')._playheadLayer._playheadPixel - props.waveformRef.current?.views.getView('zoomview').getWidth() / 2)
        props.isFromLanguageWindowRef.current = false
    }, [props.cellDataRef, props.isFromLanguageWindowRef, setLabel, props.subtitleIndexRef, props.waveformRef])

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
        if (!language || !props.languages.map((value) => `${value.code}_${value.counter}`).includes(language)) {
            setLanguage(props.languages[0] ? `${props.languages[0].code}_${props.languages[0].counter}` : null)
        }
    }, [props.languages, language])

    useEffect(() => {
        subtitleLabelRef.current.innerHTML = ''
    }, [props.mediaFile])

    useEffect(() => {
        if (volume[0]) {
            setIsMuted(false)
            const internalPlayer = props.playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.volume = volume[0]
        } else {
            setIsMuted(true)
        }
    }, [volume, props.playerRef]);

    return <>
        <div className={'w-100 position-relative'} style={{height: 'calc(100% - 3rem)', backgroundColor: 'black'}}
             onClick={() => {
                 const video = props.playerRef.current?.getInternalPlayer()
                 if (video) isPlaying ? video.pause() : video.play()
             }}>
            <ReactPlayer ref={props.playerRef} width={'100%'} height={'100%'} progressInterval={1} muted={isMuted}
                         onProgress={onProgress} onReady={onReady} onPlay={onPlayPause} onPause={onPlayPause}
                         onSeek={onSeek}
                         url={props.mediaFile?.startsWith('https://s3.subtitleqc.ai') ? `${props.mediaFile}?t=${t}` : props.mediaFile}
                         config={{file: {attributes: {onContextMenu: e => e.preventDefault()}}}}/>
            <div className={'w-100 h-100 position-absolute top-0'}/>
            <span className={'span-framerate mx-1'}>
                {props.mediaInfo?.framerate && `${props.mediaInfo.framerate} fps`}</span>
            <span ref={subtitleLabelRef} className={'span-subtitle'}/>
        </div>
        <div className={'w-100 h-100'} style={{backgroundColor: 'black'}}>
            <div className={'d-flex align-items-center px-3'} style={{height: '1rem'}}>
                <Range min={0} max={props.mediaInfo?.duration || 1} values={[seek]} disabled={!props.mediaFile}
                       onChange={values => props.playerRef.current.seekTo(values[0], 'seconds')}
                       onFinalChange={values => seek === values[0] && !isPlaying && props.playerRef.current.seekTo(values[0], 'seconds')}
                       renderTrack={({props: _props, children}) => (
                           <div {..._props} className={'input-range-track'} style={{
                               ..._props.style, background: getTrackBackground({
                                   values: [seek], colors: ['#fff', '#999'], min: 0, max: props.mediaInfo?.duration || 1
                               })
                           }}>{children}</div>)}
                       renderThumb={({props}) => (
                           <div {...props} className={'input-range-thumb'} style={{...props.style}}/>)}/>
            </div>
            <div className={'d-flex justify-content-between'} style={{height: '2rem', padding: '0 0.625rem'}}>
                <div className={'h-100 d-flex flex-nowrap align-items-center'}>
                    {isPlaying ?
                        <BsPauseFill className={'button-icon'} size={20}
                                     onClick={event => props.playerRef.current.getInternalPlayer().pause()}/> :
                        <BsPlayFill className={'button-icon'} size={20}
                                    onClick={event => props.playerRef.current.getInternalPlayer()?.play()}/>}
                    <span className={'span-duration mx-2'}>
                        {`${secToTc(seek)} / ${secToTc(props.mediaInfo?.duration)}`}
                    </span>
                </div>
                <div className={'h-100 d-flex flex-nowrap align-items-center'}>
                    <div className={'position-relative d-flex justify-content-center me-4'}
                         onMouseEnter={() => showUtilHandler(volumeRef.current)}
                         onMouseLeave={() => hideUtilHandler(volumeRef.current)}>
                        {isMuted ?
                            <HiSpeakerXMark className={'button-icon'} size={20}
                                            onClick={() => {
                                                const internalPlayer = props.playerRef.current.getInternalPlayer()
                                                setIsMuted(false)
                                                if (!volume[0]) setVolume([1])
                                                if (internalPlayer) internalPlayer.muted = false
                                            }}/> :
                            <HiSpeakerWave className={'button-icon'} size={20}
                                           onClick={() => {
                                               const internalPlayer = props.playerRef.current.getInternalPlayer()
                                               setIsMuted(true)
                                               if (internalPlayer) internalPlayer.muted = true
                                           }}/>}
                        <div ref={volumeRef} className={'position-absolute d-none rounded opacity-95'}
                             style={{height: '140px', padding: '20px', bottom: 20, backgroundColor: '#333'}}>
                            <Range step={0.01} min={0} max={1} values={isMuted ? [0] : volume}
                                   direction={Direction.Up} onChange={values => setVolume(values)}
                                   renderTrack={({props, children}) => (
                                       <div {...props} className={'input-range-track-vertical'} style={{
                                           ...props.style, background: getTrackBackground({
                                               values: isMuted ? [0] : volume,
                                               colors: ['#548BF4', '#999'],
                                               min: 0,
                                               max: 1,
                                               direction: Direction.Up
                                           })
                                       }}>{children}</div>)}
                                   renderThumb={({props}) => (
                                       <div {...props} className={'input-range-thumb'} style={{...props.style}}/>)}
                            />
                        </div>
                    </div>
                    <div className={'position-relative d-flex justify-content-center me-4'}
                         onMouseEnter={() => showUtilHandler(speedRef.current)}
                         onMouseLeave={() => hideUtilHandler(speedRef.current)}>
                        <SlSpeedometer className={'button-icon'} size={20}/>
                        <div ref={speedRef} className={'util-container d-none'}>
                            <div className={'text-center fw-bold text-nowrap mb-2'}>재생 속도</div>
                            <OverlayScrollbarsComponent options={{scrollbars: {theme: "os-theme-light"}}} defer>
                                {Array.from({length: (2 - 0.25) / 0.25 + 1}, (_, i) => 0.25 + 0.25 * i).map((value) =>
                                    <div className={'util-items'} key={`${value}`} onClick={() => {
                                        const internalPlayer = props.playerRef.current.getInternalPlayer()
                                        if (internalPlayer) internalPlayer.playbackRate = value
                                    }}>{`${value}`}</div>)}
                            </OverlayScrollbarsComponent>
                        </div>
                    </div>
                    <div className={'position-relative d-flex justify-content-center me-2'}
                         onMouseEnter={() => showUtilHandler(languageRef.current)}
                         onMouseLeave={() => hideUtilHandler(languageRef.current)}>
                        <PiGlobe className={'button-icon'} size={20}/>
                        <div ref={languageRef} className={'util-container d-none'} style={{right: '-0.5rem'}}>
                            <div className={'text-center fw-bold text-nowrap mb-2'}>언어 선택</div>
                            <OverlayScrollbarsComponent options={{scrollbars: {theme: "os-theme-light"}}} defer>
                                {props.languages.filter((value) => value.code.match(/^[a-z]{2}[A-Z]{2}$/)).map(value =>
                                    <div className={'util-items'} key={`${value.code}_${value.counter}`}
                                         onClick={() => {
                                             setLanguage(`${value.code}_${value.counter}`)
                                             if (props.playerRef.current.getInternalPlayer()?.paused) props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds')
                                         }}>{value.name}</div>)}
                            </OverlayScrollbarsComponent>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export default MediaWindow
