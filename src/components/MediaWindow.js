import ReactPlayer from "react-player";


const MediaWindow = () => {
    return <div style={{width: '100%', height: 300, justifyContent: 'center', alignItems: 'end', display: 'flex'}}>
        <ReactPlayer style={{backgroundColor: 'black'}} width={'100%'} height={'100%'}
                     controls={true} progressInterval={1} url={'https://youtu.be/n_uFzLPYDd8'}
                     config={{file: {attributes: {controlsList: 'nodownload'}}}}/>
        <label style={{position: 'absolute', color: 'white', pointerEvents: 'none', whiteSpace: 'pre'}}>sample</label>
    </div>
};

export default MediaWindow
