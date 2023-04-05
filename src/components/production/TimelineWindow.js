import {useCallback, useEffect, useRef} from "react";
import Peaks from 'peaks.js';
import {bisect, secToTc, tcToSec} from "../../utils/functions";
import {MDBCheckbox} from "mdb-react-ui-kit";


const TimelineWindow = (props) => {
    const waveformRef = useRef(null);
    const overviewRef = useRef(null);
    const resetSegments = useRef(null)
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
    const afterSeekedPromise = useCallback(() => {
        return new Promise(resolve => {
            props.waveformRef.current.on('player.seeked', () => {
                resolve()
            })
        })
    }, [props.waveformRef])

    useEffect(() => {
        resetSegments.current = props.resetSegments
    }, [props.resetSegments])

    useEffect(() => {
        if (!props.video) return
        const options = {
            mediaElement: document.querySelector('video'),
            webAudio: {
                audioContext: new AudioContext()
            },
            zoomview: {
                container: waveformRef.current,
                waveformColor: 'yellow',
                showPlayheadTime: true,
                playheadColor: 'white',
                formatPlayheadTime: (seconds) => secToTc(seconds),
                formatAxisTime: (seconds) => secToTc(seconds),
            },
            overview: {
                container: overviewRef.current,
                waveformColor: 'yellow',
                playheadColor: 'white',
                highlightColor: 'black',
                highlightStrokeColor: 'black'
            },
            segmentOptions: {
                overlay: true,
                overlayOpacity: 0.4
            },
            zoomLevels: [128, 256, 512, 1024, 2048, 4096, 8192, 16384],
            segments: []
        }
        Peaks.init(options, function (err, peaks) {
            if (err) console.log(err)
            if (peaks) {
                props.waveformRef.current = peaks
                peaks.segments.add(resetSegments.current())
                peaks.on('zoomview.click', (event) => {
                    afterSeekedPromise().then(() => {
                        if (event.evt.ctrlKey) {
                            const time = peaks.player.getCurrentTime()
                            if (!peaks.segments.find(time, time + 1).length) {
                                const addIndex = bisect(props.hotRef.current.getSourceDataAtCol('start').map(v => tcToSec(v)).filter(value => !isNaN(value)), time)
                                props.hotRef.current.alter('insert_row', addIndex, 1)
                                props.hotRef.current.setDataAtCell([[addIndex, 0, secToTc(time)], [addIndex, 1, secToTc(time + 1)]])
                            }
                        }
                    })
                })
                peaks.on("segments.dragged", (event) => {
                    const [startTime, endTime] = [event.segment.startTime.toFixed(3), event.segment.endTime.toFixed(3)]
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    if (!event.startMarker) {
                        props.hotRef.current.selectCell(row, 1)
                        props.hotRef.current.getCell(row, 1).innerHTML = secToTc(Number(endTime))
                    } else {
                        props.hotRef.current.selectCell(row, 0)
                        props.hotRef.current.getCell(row, 0).innerHTML = secToTc(Number(startTime))
                    }
                })
                peaks.on("segments.dragend", (event) => {
                    props.isFromTimelineWindowRef.current = true
                    const [startTime, endTime] = [event.segment.startTime.toFixed(3), event.segment.endTime.toFixed(3)]
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    if (!event.startMarker) {
                        props.hotRef.current.setDataAtCell(row, 1, secToTc(Number(endTime)))
                    } else {
                        props.hotRef.current.setDataAtCell(row, 0, secToTc(Number(startTime)))
                    }
                })
                peaks.on('peaks.ready', () => {
                    if (props.playerRef.current.getInternalPlayer()?.src !== props.video) {
                        props.waveformRef.current?.destroy()
                        props.waveformRef.current = null
                    }
                })
                peaks.views.getView('zoomview')?.setAmplitudeScale(2.5)
                peaks.views.getView('zoomview')?.setSegmentDragMode('no-overlap')
            }
        })
        waveformRef.current.addEventListener('wheel', onWheel, {passive: false})
        return () => {
            props.waveformRef.current?.destroy()
            props.waveformRef.current = null
        }
    }, [props.video, props.waveformRef, onWheel, afterSeekedPromise, props.hotRef, props.isFromTimelineWindowRef, props.playerRef])

    useEffect(() => {
        props.waveformRef.current?.views.getView('zoomview')?.fitToContainer()
    }, [props.size, props.waveformRef])

    useEffect(() => {
        if (!props.mediaFile) {
            props.waveformRef.current?.destroy()
            props.waveformRef.current = null
        }
    }, [props.mediaFile, props.waveformRef])

    return <>
        <div style={{display: 'flex', position: 'absolute', right: 0, zIndex: 1}}>
            <MDBCheckbox id='tcLockCheckBox' wrapperStyle={{display: 'flex', paddingRight: 10}}
                         label='TC LOCK'
                         labelStyle={{
                             fontSize: 12,
                             userSelect: 'none',
                             display: 'flex',
                             alignItems: 'center',
                             color: 'white'
                         }}
                         onChange={(event) => props.setTcLock(event.target.checked)}/>
            <MDBCheckbox id='scrollViewCheckBox' wrapperStyle={{display: 'flex', paddingRight: 10}}
                         label='SELECT CURRENT SUBTITLE WHILE PLAYING'
                         labelStyle={{
                             fontSize: 12,
                             userSelect: 'none',
                             display: 'flex',
                             alignItems: 'center',
                             color: 'white'
                         }}/>
        </div>
        <div style={{backgroundColor: 'black'}}>
            <div ref={waveformRef} style={{width: '100%', height: `${props.size.timelineWindowHeight - 100}px`}}
                 onClick={() => props.waveformRef.current?.player.pause()}/>
            <div ref={overviewRef} style={{width: '100%', height: '60px'}}/>
        </div>
    </>
};

export default TimelineWindow
