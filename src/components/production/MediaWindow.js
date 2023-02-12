import ReactPlayer from "react-player";
import {useCallback, useRef} from "react";
import {bisect, TCtoSec} from "../../utils/functions";

let subtitleIndex = 0

const MediaWindow = (props) => {
    const subtitleLabelRef = useRef(null)
    const onSeek = useCallback((seconds) => {
        if (props.isWaveSeeking.current) {
            props.isWaveSeeking.current = false
            return
        }
        props.isVideoSeeking.current = true
        props.waveformRef.current?.seekAndCenter(props.playerRef.current.getCurrentTime() / props.playerRef.current.getDuration())
        subtitleIndex = Math.max(bisect(props.cellDataRef.current.map((value) => TCtoSec(value.start)), seconds) - 1, 0)
    }, [props.waveformRef, props.playerRef, props.isVideoSeeking, props.isWaveSeeking, props.cellDataRef])
    const onPause = useCallback(() => {
        if (props.waveformRef.current) props.waveformRef.current.pause()
    }, [props.waveformRef])
    const onPlay = useCallback(() => {
        if (props.waveformRef.current) props.waveformRef.current.play()
    }, [props.waveformRef])
    const onProgress = useCallback((state) => {
    }, [])
    return <div style={{
        width: '100%', height: '100%', justifyContent: 'center', alignItems: 'end', display: 'flex',
        borderStyle: 'solid', borderWidth: 'thin'
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile}
                     onSeek={onSeek} onPause={onPause} onPlay={onPlay} onProgress={onProgress}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label ref={subtitleLabelRef}
               style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre'}}/>
    </div>
};

export default MediaWindow
