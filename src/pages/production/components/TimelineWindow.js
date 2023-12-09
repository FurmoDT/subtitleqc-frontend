import {useCallback, useEffect, useRef} from "react";
import Peaks from 'peaks.js';
import {bisect, secToTc, tcToSec} from "../../../utils/functions";
import {MDBBtn, MDBCheckbox, MDBIcon, MDBSpinner} from "mdb-react-ui-kit";

const checkboxLabelStyle = {
    fontSize: 12, userSelect: 'none', display: 'flex', alignItems: 'center', color: 'white', marginLeft: -5
}

const TimelineWindow = ({resetSegments, ...props}) => {
    const waveformRef = useRef(null);
    const overviewRef = useRef(null);
    const statusRef = useRef(null);
    const spinnerRef = useRef(null);
    const warningRef = useRef(null);
    const amplitudeScale = useRef(2)
    const moveCursorRef = useRef(null)

    const onWheel = useCallback((e) => {
        if (e.ctrlKey) {
            e.preventDefault()
            if (e.deltaY > 0) props.waveformRef.current?.zoom.zoomOut()
            else props.waveformRef.current?.zoom.zoomIn()
        } else if (e.shiftKey) {
            e.preventDefault()
            if (e.deltaY > 0) amplitudeScale.current = Math.max(amplitudeScale.current - 0.5, 0.5)
            else amplitudeScale.current = Math.min(amplitudeScale.current + 0.5, 5)
            props.waveformRef.current.views.getView('zoomview')?.setAmplitudeScale(amplitudeScale.current)
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
            webAudio: {
                audioContext: new AudioContext()
            },
            withCredentials: true,
            zoomview: {
                container: waveformRef.current,
                waveformColor: 'yellow',
                showPlayheadTime: true,
                playheadColor: 'white',
                formatPlayheadTime: (seconds) => secToTc(seconds),
                formatAxisTime: (seconds) => secToTc(seconds),
                playheadClickTolerance: -1 // uncaught
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
            if (err) {
                setStatusDisplay('error')
                console.log(err)
            }
            if (peaks) {
                props.waveformRef.current = peaks
                peaks.segments.add(resetSegments())
                peaks.on('zoomview.click', (event) => {
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
                })
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
                peaks.on("segments.click", (event) => {
                    peaks.views.getView('zoomview')?.enableSegmentDragging(false)
                    moveCursorRef.current = event.evt.target
                    if (props.selectedSegment.current === event.segment) {
                        moveCursorRef.current.style.cursor = 'default'
                        props.selectedSegment.current.update({color: 'white', editable: false})
                        props.selectedSegment.current = null
                        return
                    }
                    props.hotRef.current.selectRows(props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id))
                    peaks.views.getView('zoomview')?.enableSegmentDragging(true)
                    moveCursorRef.current.style.cursor = 'move'
                })
                peaks.on("segments.remove", (event) => {
                    event.segments.forEach(value => {
                        if (value === props.selectedSegment.current) {
                            props.selectedSegment.current = null
                        }
                    })
                })
                peaks.on('peaks.ready', () => {
                    if (!props.playerRef.current.getInternalPlayer()?.src.startsWith(props.video)) {
                        props.waveformRef.current?.destroy()
                        props.waveformRef.current = null
                    } else {
                        setStatusDisplay('loaded')
                    }
                })
                amplitudeScale.current = 2
                peaks.views.getView('zoomview')?.setAmplitudeScale(amplitudeScale.current)
                peaks.views.getView('zoomview')?.setSegmentDragMode('no-overlap')
            }
        })
        waveformRef.current.addEventListener('wheel', onWheel, {passive: false})
        waveformRef.current.addEventListener('keydown', (event) => {
            if (!props.tcLockRef.current && event.key === 'Delete') {
                const curSegment = props.selectedSegment.current
                if (curSegment) {
                    const curRow = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(curSegment.id)
                    props.hotRef.current.setDataAtCell([[curRow, 0, ''], [curRow, 1, '']])
                    props.selectedSegment.current = null
                    moveCursorRef.current.style.cursor = 'default'
                }
            }
        })
        waveformRef.current.setAttribute('tabindex', 0)
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
                             label='TC Lock' labelStyle={checkboxLabelStyle} defaultChecked={true}
                             onChange={(event) => {
                                 props.setTcLock(event.target.checked)
                                 event.target.blur()
                             }}/>
                <MDBCheckbox id='playheadCenter-checkbox' wrapperClass={'d-flex mx-2'}
                             label='Playhead Center' labelStyle={checkboxLabelStyle}
                             onChange={(event) => event.target.blur()}/>
                <MDBCheckbox id='scrollView-checkbox' wrapperClass={'d-flex mx-2'}
                             label='Current Subtitle Center' labelStyle={checkboxLabelStyle}
                             onChange={(event) => event.target.blur()}/>
            </div>
        </div>
        <div style={{backgroundColor: 'black'}} onClick={() => props.focusedRef.current = props.waveformRef.current}>
            <div ref={statusRef} className={'position-absolute start-50 translate-middle-x'}>
                <MDBSpinner ref={spinnerRef} className={'mt-3'}
                            style={{width: `${props.size.height / 3}px`, height: `${props.size.height / 3}px`}}/>
                <MDBBtn ref={warningRef} className={'mt-3'} size={'sm'} color={'link'} disabled>
                    <MDBIcon fas icon="exclamation-circle" size={'3x'} color={'white'}/>
                </MDBBtn>
            </div>
            <div ref={waveformRef} className={'w-100'} style={{height: `${props.size.height - 100}px`}}/>
            <div ref={overviewRef} className={'w-100'} style={{height: '30px'}}/>
        </div>
    </>
};

export default TimelineWindow
