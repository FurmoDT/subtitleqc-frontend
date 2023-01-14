import WaveSurfer from 'wavesurfer.js';
import {useEffect, useRef} from "react";
import {MDBBtn} from "mdb-react-ui-kit";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";

let wavesurfer

const TimelineWindow = () => {
    const buttonRef = useRef(null);
    const waveformRef = useRef(null);
    const timelineRef = useRef(null);

    useEffect(() => {
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
            wavesurfer.play()
        });
    }, []);
    return <div style={{width: '50%'}}>
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
