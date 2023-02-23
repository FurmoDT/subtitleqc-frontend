import {useCallback, useEffect, useRef} from "react";
import Peaks from 'peaks.js';
import {secToTc} from "../../utils/functions";


const TimelineWindow = (props) => {
    const waveformRef = useRef(null);
    const overviewRef = useRef(null);

    const onWheel = useCallback((e) => {
        if (e.ctrlKey) {
            e.preventDefault()
            if (e.deltaY > 0) props.waveformRef.current?.zoom.zoomIn()
            else props.waveformRef.current?.zoom.zoomOut()
        }
    }, [props.waveformRef])

    useEffect(() => {
        if (!props.mediaFile) return
        const options = {
            containers: {
                zoomview: waveformRef.current,
                overview: overviewRef.current
            },
            mediaElement: document.querySelector('video'),
            webAudio: {
                audioContext: new AudioContext()
            },
            zoomview: {
                waveformColor: 'steelblue',
                playedWaveformColor: 'lightgreen',
                showPlayheadTime: true,
                formatPlayheadTime: (seconds) => secToTc(seconds),
                formatAxisTime: (seconds) => secToTc(seconds)
            },
            zoomLevels: [128, 256, 512, 1024, 2048, 4096, 8192, 16384],
        }
        Peaks.init(options, function (err, peaks) {
            if (peaks) {
                props.waveformRef.current = peaks
            }
        })
        waveformRef.current.addEventListener('wheel', onWheel, {passive: false})
        return () => {
            props.waveformRef.current?.destroy()
        }
    }, [props.mediaFile, props.waveformRef, onWheel])

    useEffect(() => {
        props.waveformRef.current?.views.getView('zoomview')?.fitToContainer()
    }, [props.size, props.waveformRef])

    return <>
        <div style={{width: '100%', height: `${props.size.timelineWindowHeight - 130}px`}} ref={waveformRef}/>
        <div style={{width: '100%', height: '80px'}} ref={overviewRef}/>
    </>
};

export default TimelineWindow
