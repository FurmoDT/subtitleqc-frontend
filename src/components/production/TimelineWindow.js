import WaveSurfer from 'wavesurfer.js';
import {useEffect, useRef} from "react";
import {MDBBtn} from "mdb-react-ui-kit";
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";

let wavesurfer
let pxPerSec = 300

function formatTimeCallback(seconds, pxPerSec) {
    seconds = Number(seconds);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 60 / 60);
    seconds = seconds % 60;

    // fill up seconds with zeroes
    let secondsStr
    if (pxPerSec >= 150) {
        secondsStr = seconds.toFixed(3);
    } else {
        secondsStr = seconds.toFixed(1);
    }
    let minutesStr = minutes < 10 ? '0' + minutes.toString() : minutes
    let hoursStr = hours < 10 ? '0' + hours.toString() : hours

    if (seconds < 10) secondsStr = '0' + secondsStr;

    return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

function timeInterval(pxPerSec) {
    let retval = 1;
    if (pxPerSec >= 250) {
        retval = 0.1;
    } else if (pxPerSec >= 100) {
        retval = 0.25;
    } else {
        retval = 1;
    }
    return retval;
}

function primaryLabelInterval(pxPerSec) {
    let retval
    if (pxPerSec >= 250) {
        retval = 10;
    } else if (pxPerSec >= 100) {
        retval = 4;
    } else {
        retval = 1;
    }
    return retval;
}

const TimelineWindow = (props) => {
    const buttonRef = useRef(null);
    const waveformRef = useRef(null);
    const timelineRef = useRef(null);

    const onWheel = (e) => {
        if (props.waveformRef.current) {
            if (e.deltaY > 0) {
                pxPerSec = Math.max(pxPerSec - 20, 100);
                // props.waveformRef.current.zoom(pxPerSec)
            } else {
                pxPerSec = Math.min(pxPerSec + 20, 300);
                // props.waveformRef.current.zoom(pxPerSec)
            }
        }
    }

    useEffect(() => {
        if (wavesurfer) {
            wavesurfer.destroy()
            if (!wavesurfer.isReady) {
                buttonRef.current.style.display = ''
                if (props.waveformRef.current) props.waveformRef.current = null
            }
        }
        wavesurfer = WaveSurfer.create({
            container: waveformRef.current,
            autoCenter: false,
            waveColor: 'violet',
            progressColor: 'purple',
            cursorColor: 'purple',
            scrollParent: true,
            normalize: true,
            minPxPerSec: pxPerSec,
            plugins: [TimelinePlugin.create({
                container: timelineRef.current,
                formatTimeCallback: formatTimeCallback,
                timeInterval: timeInterval,
                primaryLabelInterval: primaryLabelInterval,
                secondaryLabelInterval: false,
                primaryColor: 'blue',
                primaryFontColor: 'blue',
            }),]
        });
        wavesurfer.on('loading', function (e) {
            if (buttonRef.current.style.display === '' && e >= 0) buttonRef.current.style.display = 'none'
        })
        wavesurfer.on('ready', function () {
            wavesurfer.setMute(true)
            props.waveformRef.current = wavesurfer
            props.playerRef.current.getInternalPlayer().pause()
            wavesurfer.seekAndCenter(props.playerRef.current.getCurrentTime() / props.playerRef.current.getDuration())
        });
        wavesurfer.on('seek', () => {
            if (!wavesurfer.isReady) return
            if (props.isVideoSeeking.current) {
                props.isVideoSeeking.current = false
                return
            }
            props.isWaveSeeking.current = true
            props.playerRef.current.getInternalPlayer().pause()
            props.playerRef.current.seekTo(wavesurfer.getCurrentTime(), 'seconds')
        })
        wavesurfer.on('audioprocess', function () {
            const curWidth = wavesurfer.drawer.wrapper.scrollWidth * wavesurfer.getCurrentTime() / wavesurfer.getDuration()
            while (wavesurfer.drawer.wrapper.scrollLeft + wavesurfer.drawer.wrapper.offsetWidth < curWidth) wavesurfer.drawer.wrapper.scrollLeft = wavesurfer.drawer.wrapper.scrollLeft + wavesurfer.drawer.wrapper.offsetWidth
        });
    }, [props.mediaFile, props.playerRef, props.waveformRef, props.isVideoSeeking, props.isWaveSeeking]);
    return <div style={{width: '100%', height: 150}} onWheel={onWheel}>
        <MDBBtn ref={buttonRef} color={'secondary'} disabled={!props.mediaFile} onClick={() => {
            wavesurfer.load(document.querySelector('video'))
        }}>Generate Waveform</MDBBtn>
        <div ref={waveformRef}/>
        <div ref={timelineRef}/>
    </div>
};

export default TimelineWindow
