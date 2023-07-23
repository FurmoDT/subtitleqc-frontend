import {useCallback, useEffect, useRef} from "react";
import Peaks from 'peaks.js';
import {bisect, secToTc, tcToSec} from "../../../utils/functions";
import {MDBBtn, MDBCheckbox, MDBIcon, MDBSpinner} from "mdb-react-ui-kit";

const checkboxLabelStyle = {
    fontSize: 12, userSelect: 'none', display: 'flex', alignItems: 'center', color: 'white', marginLeft: -5
}

const TimelineWindow = (props) => {
    const waveformRef = useRef(null);
    const overviewRef = useRef(null);
    const resetSegments = useRef(null)
    const statusRef = useRef(null);
    const spinnerRef = useRef(null);
    const warningRef = useRef(null);
    const amplitudeScale = useRef(2)

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
    useEffect(() => {
        resetSegments.current = props.resetSegments
    }, [props.resetSegments])

    useEffect(() => {
        if (!props.video) return
        setStatusDisplay('isLoading')
        window.addEventListener('error', (ev) => {
            if (ev.error?.name === 'TypeError' && ev.error.message.startsWith('WaveformData')) setStatusDisplay('error')
        })
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
                playheadClickTolerance: -1
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
                peaks.on("segments.mouseenter", (event) => {
                    if (event.segment.editable) event.evt.target.style.cursor = 'move'
                })
                peaks.on("segments.mouseleave", (event) => {
                    event.evt.target.style.cursor = 'default'
                })
                peaks.on("segments.dragstart", (event) => {
                    props.hotRef.current.scrollViewportTo(props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id) - Math.round(props.hotRef.current.countVisibleRows() / 2))
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
                    props.isFromTimelineWindowRef.current = true
                    const [start, end] = [secToTc(Number(event.segment.startTime.toFixed(3))), secToTc(Number(event.segment.endTime.toFixed(3)))]
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    const cells = []
                    if (props.hotRef.current.getDataAtCell(row, 0) !== start) cells.push([row, 0, start])
                    if (props.hotRef.current.getDataAtCell(row, 1) !== end) cells.push([row, 1, end])
                    props.hotRef.current.setDataAtCell(cells)
                    event.segment.update()
                })
                peaks.on("segments.click", (event) => {
                    if (props.selectedSegment.current === event.segment) {
                        event.evt.target.style.cursor = 'default'
                        props.selectedSegment.current.update({color: 'white', editable: false})
                        props.selectedSegment.current = null
                        return
                    }
                    props.selectedSegment.current?.update({color: 'white', editable: false})
                    props.selectedSegment.current = event.segment
                    props.selectedSegment.current.update({color: 'red', editable: !props.tcLockRef.current})
                })
                peaks.on('peaks.ready', () => {
                    if (props.playerRef.current.getInternalPlayer()?.src !== props.video) {
                        props.waveformRef.current?.destroy()
                        props.waveformRef.current = null
                    } else {
                        setStatusDisplay('loaded')
                    }
                })
                amplitudeScale.current = 2
                peaks.views.getView('zoomview')?.setAmplitudeScale(amplitudeScale.current)
                peaks.views.getView('zoomview')?.enableSegmentDragging(true)
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
                }
            }
        })
        waveformRef.current.setAttribute('tabindex', 0)
        return () => {
            props.waveformRef.current?.destroy()
            props.waveformRef.current = null
            props.selectedSegment.current = null
            window.removeEventListener('error', (ev) => {
                if (ev.error.name === 'TypeError') setStatusDisplay('error')
            })
        }
    }, [props.video, props.waveformRef, onWheel, afterSeekedPromise, props.hotRef, props.isFromTimelineWindowRef, props.playerRef, props.tcLockRef, props.selectedSegment])

    useEffect(() => {
        props.waveformRef.current?.views.getView('zoomview')?.fitToContainer()
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
        <div style={{position: 'absolute', right: 0, zIndex: 1}}>
            <div style={{display: 'flex', marginLeft: 'auto'}}>
                <MDBCheckbox id='tcLock-checkbox' wrapperStyle={{display: 'flex', marginRight: 10}}
                             label='TC Lock' labelStyle={checkboxLabelStyle} defaultChecked={true}
                             onChange={(event) => {
                                 props.setTcLock(event.target.checked)
                                 event.target.blur()
                             }}/>
                <MDBCheckbox id='playheadCenter-checkbox'
                             wrapperStyle={{display: 'flex', marginLeft: 10, marginRight: 10}}
                             label='Playhead Center' labelStyle={checkboxLabelStyle}
                             onChange={(event) => event.target.blur()}/>
                <MDBCheckbox id='scrollView-checkbox' wrapperStyle={{display: 'flex', marginLeft: 10, marginRight: 10}}
                             label='Current Subtitle Center' labelStyle={checkboxLabelStyle}
                             onChange={(event) => event.target.blur()}/>
            </div>
        </div>
        <div style={{backgroundColor: 'black'}} onClick={() => {
            props.focusedRef.current = props.waveformRef.current
        }}>
            <div ref={statusRef} className={'text-center'}>
                <MDBSpinner ref={spinnerRef} style={{
                    width: `${props.size.height / 3}px`,
                    height: `${props.size.height / 3}px`,
                    marginTop: '10px'
                }}/>
                <MDBBtn ref={warningRef} style={{marginTop: '10px'}} size={'sm'} color={'link'} disabled>
                    <MDBIcon fas icon="exclamation-circle" size={'3x'} color={'white'}/>
                </MDBBtn>
            </div>
            <div ref={waveformRef} style={{width: '100%', height: `${props.size.height - 100}px`}}
                 onClick={() => props.waveformRef.current?.player.pause()}/>
            <div ref={overviewRef} style={{width: '100%', height: '30px'}}/>
        </div>
    </>
};

export default TimelineWindow
