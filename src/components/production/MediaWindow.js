import ReactPlayer from "react-player";
import {useCallback, useEffect, useRef} from "react";
import {bisect, tcToSec} from "../../utils/functions";
import {MDBBtn, MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon} from "mdb-react-ui-kit";

let subtitleIndex = 0
let subtitleLanguage = null

const MediaWindow = (props) => {
    const subtitleLabelRef = useRef(null)
    const setSubtitleLabel = useCallback((seconds) => {
        const row = props.cellDataRef.current[subtitleIndex]
        if (seconds >= tcToSec(row.start) && seconds <= tcToSec(row.end)) subtitleLabelRef.current.innerText = props.cellDataRef.current[subtitleIndex][subtitleLanguage] || ''
        else subtitleLabelRef.current.innerText = ''
    }, [props.cellDataRef])
    const onPlaybackRateChange = useCallback((event) => {
        if (props.waveformRef.current) {
            props.waveformRef.current.setPlaybackRate(event)
            props.waveformRef.current.seekTo(props.playerRef.current.getCurrentTime() / props.playerRef.current.getDuration())
        }
    }, [props.waveformRef, props.playerRef])
    const onSeek = useCallback((seconds) => {
        subtitleIndex = bisect(props.cellDataRef.current.map((value) => tcToSec(value.start)), seconds)
        if (tcToSec(props.cellDataRef.current[subtitleIndex].start) !== seconds) subtitleIndex = Math.max(subtitleIndex - 1, 0)
        setSubtitleLabel(seconds)
        if (props.isWaveSeeking.current) {
            props.isWaveSeeking.current = false
            return
        }
        props.isVideoSeeking.current = true
        props.waveformRef.current?.seekAndCenter(props.playerRef.current.getCurrentTime() / props.playerRef.current.getDuration())
    }, [props.waveformRef, props.playerRef, props.isVideoSeeking, props.isWaveSeeking, props.cellDataRef, setSubtitleLabel])
    const onPause = useCallback(() => {
        props.waveformRef.current?.pause()
    }, [props.waveformRef])
    const onPlay = useCallback(() => {
        props.waveformRef.current?.play()
    }, [props.waveformRef])
    const onProgress = useCallback((state) => {
        setSubtitleLabel(state.playedSeconds)
        if (state.playedSeconds >= tcToSec(props.cellDataRef.current[subtitleIndex].end)) subtitleIndex += 1
    }, [props.cellDataRef, setSubtitleLabel])
    useEffect(() => {
        subtitleLanguage = `${props.languages[0].code}_${props.languages[0].counter}`
    }, [props.languages])
    return <div style={{
        width: '100%', height: '100%', justifyContent: 'center', alignItems: 'end', display: 'flex',
        borderStyle: 'solid', borderWidth: 'thin'
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile} onPause={onPause} onPlay={onPlay}
                     onPlaybackRateChange={onPlaybackRateChange} onSeek={onSeek} onProgress={onProgress}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label ref={subtitleLabelRef}
               style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre'}}/>
        <MDBDropdown style={{position: 'absolute', top: 5, right: 5}}>
            <MDBDropdownToggle color={'none'} tag={'section'}>
                <MDBBtn style={{color: 'white'}} tag='a' color={'none'}>
                    <MDBIcon fas icon='globe' size={'lg'}/>
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
    </div>
};

export default MediaWindow
