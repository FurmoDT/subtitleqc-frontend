import ReactPlayer from "react-player";
import {useCallback} from "react";


const MediaWindow = (props) => {
    const onSeek = useCallback(() => {
        console.log('onSeek')
    }, [props.waveformRef])
    const onPause = useCallback(() => {
        if (props.waveformRef.current) props.waveformRef.current.pause()
    }, [props.waveformRef])
    const onPlay = useCallback(() => {
        if (props.waveformRef.current) props.waveformRef.current.play()
    }, [props.waveformRef])
    return <div style={{
        width: '100%', height: 300, justifyContent: 'center', alignItems: 'end', display: 'flex', minWidth: 400
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile}
                     onSeek={onSeek} onPause={onPause} onPlay={onPlay}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre'}}>sample</label>
    </div>
};

export default MediaWindow
