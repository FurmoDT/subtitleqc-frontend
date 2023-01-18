import ReactPlayer from "react-player";
import {useCallback} from "react";


const MediaWindow = (props) => {
    const onSeek = useCallback(() => {
        console.log('onSeek')
    }, [])
    const onPause = useCallback(() => {
        console.log('onPause')
    }, [])
    const onPlay = useCallback(() => {
        console.log('onPlay')
    }, [])
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
