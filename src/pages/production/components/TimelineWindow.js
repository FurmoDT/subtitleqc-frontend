import {useCallback, useEffect, useRef} from "react";
import Peaks from 'peaks.js';
import {bisect, secToTc, tcToSec} from "../../../utils/functions";
import {MDBBtn, MDBCheckbox, MDBIcon, MDBSpinner} from "mdb-react-ui-kit";

const TimelineWindow = ({resetSegments, ...props}) => {
    const zoomviewContainerRef = useRef(null);
    const overviewContainerRef = useRef(null);
    const statusRef = useRef(null);
    const spinnerRef = useRef(null);
    const warningRef = useRef(null);
    const amplitudeScale = useRef(2)
    const moveCursorRef = useRef(null)

    const onWheel = useCallback((e) => {
        const waveform = props.waveformRef.current
        if (e.ctrlKey) {
            e.preventDefault()
            if (e.deltaY > 0) waveform.zoom.zoomOut()
            else waveform.zoom.zoomIn()
        } else if (e.shiftKey) {
            e.preventDefault()
            if (e.deltaY > 0) amplitudeScale.current = Math.max(amplitudeScale.current - 0.5, 0.5)
            else amplitudeScale.current = Math.min(amplitudeScale.current + 0.5, 5)
            waveform.views.getView('zoomview').setAmplitudeScale(amplitudeScale.current)
        } else {
            if (e.deltaY > 0) waveform.views.getView('zoomview').scrollWaveform({seconds: -1})
            else waveform.views.getView('zoomview').scrollWaveform({seconds: 1})
        }
    }, [props.waveformRef])
    const afterSeekedPromise = useCallback(() => {
        return new Promise(resolve => {
            props.waveformRef.current.on('player.seeked', () => {
                resolve()
            })
        })
    }, [props.waveformRef])
    const setStatusDisplay = (status) => {
        if (status === 'isLoading') {
            spinnerRef.current.style.display = ''
            warningRef.current.style.display = 'none'
        } else if (status === 'error') {
            spinnerRef.current.style.display = 'none'
            warningRef.current.style.display = ''
        } else if (status === 'default' || status === 'loaded') {
            spinnerRef.current.style.display = 'none'
            warningRef.current.style.display = 'none'
        }
    }
    const errorHandler = useCallback((ev) => {
        if (ev.error?.name === 'TypeError' && ev.error.message.startsWith('WaveformData')) setStatusDisplay('error')
    }, [])

    useEffect(() => {
        if (!props.video) return
        setStatusDisplay('isLoading')
        window.addEventListener('error', errorHandler)
        const options = {
            mediaElement: document.querySelector('video'),
            webAudio: {audioContext: new AudioContext()},
            withCredentials: true,
            zoomview: {
                container: zoomviewContainerRef.current,
                waveformColor: 'yellow',
                showPlayheadTime: true,
                playheadColor: 'white',
                formatPlayheadTime: (seconds) => secToTc(seconds),
                formatAxisTime: (seconds) => secToTc(seconds),
                playheadClickTolerance: -1 // uncaught
            },
            overview: {
                container: overviewContainerRef.current,
                waveformColor: 'yellow',
                playheadColor: 'white',
                highlightColor: 'black',
                highlightStrokeColor: 'black'
            },
            segmentOptions: {overlay: true, overlayOpacity: 0.4},
            zoomLevels: [128, 256, 512, 1024, 2048, 4096, 8192, 16384],
            segments: []
        }
        Peaks.init(options, function (err, peaks) {
            if (err) {
                setStatusDisplay('error')
                console.log(err)
            }
            if (peaks) {
                props.waveformRef.current = peaks
                peaks.segments.add(resetSegments())
                peaks.on("segments.mouseenter", (event) => {
                    if (event.segment.editable) {
                        moveCursorRef.current = event.evt.target
                        moveCursorRef.current.style.cursor = 'move'
                    }
                })
                peaks.on("segments.mouseleave", (event) => {
                    event.evt.target.style.cursor = 'default'
                })
                peaks.on("segments.dragged", (event) => {
                    const [start, end] = [secToTc(Number(event.segment.startTime.toFixed(3))), secToTc(Number(event.segment.endTime.toFixed(3)))]
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    const startElement = props.hotRef.current.getCell(row, 0)
                    const endElement = props.hotRef.current.getCell(row, 1)
                    const cells = []
                    if (startElement && start !== startElement.innerHTML) {
                        cells.push([row, 0, row, 0])
                        startElement.innerHTML = start
                    }
                    if (endElement && end !== endElement.innerHTML) {
                        cells.push([row, 1, row, 1])
                        endElement.innerHTML = end
                    }
                    if (JSON.stringify(props.hotRef.current.getSelected()) !== JSON.stringify(cells)) props.hotRef.current.selectCells(cells)
                })
                peaks.on("segments.dragend", (event) => {
                    const [start, end] = [secToTc(Number(event.segment.startTime.toFixed(3))), secToTc(Number(event.segment.endTime.toFixed(3)))]
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    const cells = []
                    if (props.hotRef.current.getDataAtCell(row, 0) !== start) cells.push([row, 0, start])
                    if (props.hotRef.current.getDataAtCell(row, 1) !== end) cells.push([row, 1, end])
                    props.hotRef.current.setDataAtCell(cells, 'timelineWindow')
                })
                peaks.on("segments.remove_all", () => {
                    props.selectedSegment.current = null
                    if (moveCursorRef.current) moveCursorRef.current.style.cursor = 'default'
                })
                peaks.on("segments.remove", (event) => {
                    event.segments.forEach(value => {
                        if (value === props.selectedSegment.current) {
                            props.selectedSegment.current = null
                            if (moveCursorRef.current) moveCursorRef.current.style.cursor = 'default'
                        }
                    })
                })
                let isDoubleClick = false;
                let clickTimer;
                peaks.on('peaks.ready', () => {
                    if (!props.playerRef.current.getInternalPlayer()?.src.startsWith(props.video)) {
                        props.waveformRef.current?.destroy()
                        props.waveformRef.current = null
                    } else {
                        setStatusDisplay('loaded')
                    }
                    peaks.on('zoomview.click', (event) => {
                        const seeker = () => {
                            peaks.player.seek(event.time)
                            afterSeekedPromise().then(() => {
                                props.waveformRef.current?.player.pause()
                                if (event.evt.ctrlKey) {
                                    const time = peaks.player.getCurrentTime()
                                    if (!peaks.segments.find(time, time + 1).length) {
                                        const addIndex = bisect(props.hotRef.current.getSourceDataAtCol('start').map(v => tcToSec(v)).filter(value => !isNaN(value)), time)
                                        props.hotRef.current.alter('insert_row', addIndex, 1)
                                        props.hotRef.current.setDataAtCell([[addIndex, 0, secToTc(time)], [addIndex, 1, secToTc(time + 1)]])
                                    }
                                }
                            })
                        }
                        if (!isDoubleClick) {
                            isDoubleClick = true
                            clickTimer = setTimeout(() => {
                                isDoubleClick = false;
                                seeker()
                            }, 300);
                        } else {
                            clearTimeout(clickTimer)
                            isDoubleClick = false
                            const segment = peaks.segments.find(event.time, event.time)[0]
                            if (segment) {
                                peaks.views.getView('zoomview').enableSegmentDragging(false)
                                moveCursorRef.current = event.evt.target
                                if (props.selectedSegment.current === segment) {
                                    moveCursorRef.current.style.cursor = 'default'
                                    props.selectedSegment.current.update({color: 'white', editable: false})
                                    props.selectedSegment.current = null
                                    return
                                }
                                const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(segment.id)
                                props.hotRef.current.selectCells([[row, 0, row, props.hotRef.current.countCols() - 1], [row, 4]])
                                peaks.views.getView('zoomview').enableSegmentDragging(true)
                                moveCursorRef.current.style.cursor = 'move'
                            }
                            seeker()
                        }
                    })
                    zoomviewContainerRef.current.addEventListener('wheel', onWheel, {passive: false})
                    zoomviewContainerRef.current.setAttribute('tabindex', 0)
                })
                amplitudeScale.current = 2
                peaks.views.getView('zoomview')?.setAmplitudeScale(amplitudeScale.current)
                peaks.views.getView('zoomview')?.setSegmentDragMode('no-overlap')
                peaks.views.getView('zoomview')?.enableSeek(false)
            }
        })
        return () => {
            props.waveformRef.current?.destroy()
            props.waveformRef.current = null
            props.selectedSegment.current = null
            window.removeEventListener('error', errorHandler)
        }
    }, [props.video, props.waveformRef, onWheel, errorHandler, afterSeekedPromise, resetSegments, props.hotRef, props.playerRef, props.tcLockRef, props.selectedSegment])

    useEffect(() => {
        props.waveformRef.current?.views.getView('zoomview')?.fitToContainer()
        props.waveformRef.current?.views.getView('overview')?.fitToContainer()
    }, [props.size, props.waveformRef])

    useEffect(() => {
        setStatusDisplay('default')
        if (!props.mediaFile) {
            statusRef.current.style.display = 'none'
            props.waveformRef.current?.destroy()
            props.waveformRef.current = null
        } else statusRef.current.style.display = ''
    }, [props.mediaFile, props.waveformRef])

    return <>
        <div className={'position-absolute end-0'} style={{zIndex: 1}}>
            <div className={'d-flex ms-auto'}>
                <MDBCheckbox id='tcLock-checkbox' wrapperClass={'d-flex mx-2'}
                             label='TC Lock' labelClass={'timelineWindow-checkbox-label'} checked={props.tcLock}
                             onChange={(event) => {
                                 props.setTcLock(event.target.checked)
                                 event.target.blur()
                             }}/>
                <MDBCheckbox id='playheadCenter-checkbox' wrapperClass={'d-flex mx-2'}
                             label='Playhead Center' labelClass={'timelineWindow-checkbox-label'}
                             onChange={(event) => event.target.blur()}/>
                <MDBCheckbox id='scrollView-checkbox' wrapperClass={'d-flex mx-2'}
                             label='Current Subtitle Center' labelClass={'timelineWindow-checkbox-label'}
                             onChange={(event) => event.target.blur()}/>
            </div>
        </div>
        <div style={{backgroundColor: 'black'}}>
            <div ref={statusRef} className={'position-absolute start-50 translate-middle-x'}>
                <MDBSpinner ref={spinnerRef} className={'mt-3'}
                            style={{width: `${props.size.height / 3}px`, height: `${props.size.height / 3}px`}}/>
                <MDBBtn ref={warningRef} className={'mt-3'} size={'sm'} color={'link'} disabled>
                    <MDBIcon fas icon="exclamation-circle" size={'3x'} color={'white'}/>
                </MDBBtn>
            </div>
            <div ref={zoomviewContainerRef} className={'w-100'} style={{height: `${props.size.height - 100}px`}}/>
            <div ref={overviewContainerRef} className={'w-100'} style={{height: '30px'}}/>
        </div>
    </>
};

export default TimelineWindow
