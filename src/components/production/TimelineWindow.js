import WaveSurfer from 'wavesurfer.js';
import {useCallback, useEffect, useRef} from "react";
import {MDBBtn} from "mdb-react-ui-kit";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";

let wavesurfer

const TimelineWindow = (props) => {
    const buttonRef = useRef(null);
    const waveformRef = useRef(null);
    const timelineRef = useRef(null);

    const handleRef = useCallback((node) => {
        waveformRef.current = node
        props.timelineRef.current = node
    }, [props.timelineRef])

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
            wavesurfer.play()
        });
    }, [props.mediaFile]);
    return <div style={{borderStyle: 'solid', borderWidth: 'thin'}}>
        <div ref={handleRef}/>
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
