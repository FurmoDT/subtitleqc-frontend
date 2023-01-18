import ReactPlayer from "react-player";


const MediaWindow = (props) => {
    return <div style={{
        width: '100%', height: 300, justifyContent: 'center', alignItems: 'end', display: 'flex', minWidth: 400
    }}>
        <ReactPlayer ref={props.playerRef} style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={props.mediaFile}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre'}}>sample</label>
    </div>
};

export default MediaWindow
