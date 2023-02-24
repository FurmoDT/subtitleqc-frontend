import {useCallback, useEffect, useRef} from "react";
import Peaks from 'peaks.js';
import {secToTc} from "../../utils/functions";
import {createSegmentMarker} from "../../utils/createSegmentMarker";


const TimelineWindow = (props) => {
    const waveformRef = useRef(null);
    const overviewRef = useRef(null);
    const onWheel = useCallback((e) => {
        if (e.ctrlKey) {
            e.preventDefault()
            if (e.deltaY > 0) props.waveformRef.current?.zoom.zoomOut()
            else props.waveformRef.current?.zoom.zoomIn()
        } else {
            const player = props.waveformRef.current?.player
            if (e.deltaY > 0) player?.seek(player.getCurrentTime() - 1)
            else player?.seek(player.getCurrentTime() + 1)
        }
    }, [props.waveformRef])

    useEffect(() => {
        if (!props.video) return
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
                formatAxisTime: (seconds) => secToTc(seconds),
            },
            createSegmentMarker: createSegmentMarker,
            zoomLevels: [128, 256, 512, 1024, 2048, 4096, 8192, 16384],
            segments: []
        }
        Peaks.init(options, function (err, peaks) {
            if (err) console.log(err)
            if (peaks) {
                props.waveformRef.current = peaks
                peaks.on('zoomview.dblclick', (event) => {
                    const time = peaks.player.getCurrentTime()
                    peaks.segments.add({
                        startTime: time,
                        endTime: time + 1,
                        color: 'darkgrey',
                        editable: true,
                    })
                })
            }
        })
        waveformRef.current.addEventListener('wheel', onWheel, {passive: false})
        return () => {
            props.waveformRef.current?.destroy()
        }
    }, [props.video, props.waveformRef, onWheel])

    useEffect(() => {
        props.waveformRef.current?.views.getView('zoomview')?.fitToContainer()
    }, [props.size, props.waveformRef])

    return <>
        <div ref={waveformRef} style={{width: '100%', height: `${props.size.timelineWindowHeight - 130}px`}}
             onClick={() => props.waveformRef.current?.player.pause()}/>
        <div ref={overviewRef} style={{width: '100%', height: '80px'}}/>
    </>
};

export default TimelineWindow
