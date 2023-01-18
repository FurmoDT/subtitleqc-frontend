import WaveSurfer from 'wavesurfer.js';
import {useEffect, useRef} from "react";
import {MDBBtn} from "mdb-react-ui-kit";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";

let wavesurfer

const TimelineWindow = (props) => {
    const buttonRef = useRef(null);
    const waveformRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
        buttonRef.current.style.display = ''
        if (wavesurfer) wavesurfer.destroy()
        wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            cursorColor: 'purple',
            scrollParent: true,
            plugins: [
                TimelinePlugin.create({
                    container: timelineRef.current
                }),
            ]
        });
        wavesurfer.on('loading', function (e) {
            if (buttonRef.current.style.display === '' && e === 0) buttonRef.current.style.display = 'none'
        })
        wavesurfer.on('ready', function () {
            wavesurfer.setMute(true)
            props.waveformRef.current = wavesurfer
        });
        wavesurfer.on('seek', () => {
            console.log('seek')
        })
        wavesurfer.on('pause', () => {
            console.log('pause')
        })
        wavesurfer.on('play', () => {
            console.log('play')
        })
    }, [props.mediaFile, props.playerRef, props.waveformRef]);
    return <div style={{borderStyle: 'solid', borderWidth: 'thin'}}>
        <div ref={waveformRef}/>
        <div ref={timelineRef}/>
        <MDBBtn onClick={() => {
            wavesurfer.playPause()
        }}>play/pause</MDBBtn>
        <MDBBtn ref={buttonRef} onClick={() => {
            wavesurfer.load(document.querySelector('video'))
        }}>Generate Waveform</MDBBtn>
    </div>
};

export default TimelineWindow
