import {useCallback, useEffect, useRef, useState} from "react";
import Peaks from 'peaks.js';
import {bisect, secToTc, tcToSec} from "../../../utils/functions";
import {MDBBtn, MDBCheckbox, MDBIcon, MDBSpinner} from "mdb-react-ui-kit";
import {SCRIPT_COLUMN} from "../../../utils/hotRenderer";
import {Item, Menu, useContextMenu} from "react-contexify";
import "../../../css/ReactContexify.css";

const TimelineWindow = ({resetSegments, ...props}) => {
    const zoomviewContainerRef = useRef(null);
    const overviewContainerRef = useRef(null);
    const statusRef = useRef(null);
    const spinnerRef = useRef(null);
    const warningRef = useRef(null);
    const amplitudeScale = useRef(2)
    const moveCursorRef = useRef(null)
    const [initialized, setInitialized] = useState(false)
    const contextMenuId = 'context-menu'
    const [contextMenuSegment, setContextMenuSegment] = useState(null)
    const {show: contextMenuShow} = useContextMenu({id: contextMenuId});

    const insertSegment = useCallback((time) => {
        if (!props.waveformRef.current.segments.find(time, time + 1).length) {
            const addIndex = bisect(props.hotRef.current.getSourceDataAtCol('start').map(v => tcToSec(v)).filter(value => !isNaN(value)), time)
            props.hotRef.current.alter('insert_row', addIndex, 1)
            props.hotRef.current.setDataAtCell([[addIndex, 0, secToTc(time)], [addIndex, 1, secToTc(time + 1)]])
            const select = [[addIndex, 0, addIndex, props.hotRef.current.countCols() - 1]]
            if (props.hotRef.current.countCols() > SCRIPT_COLUMN) select.push([addIndex, SCRIPT_COLUMN])
            props.hotRef.current.selectCells(select)
            if (select.length === 2) {
                props.hotRef.current.getActiveEditor().enableFullEditMode()
                props.hotRef.current.getActiveEditor().beginEditing()
            }
        }
    }, [props.waveformRef, props.hotRef])

    const onWheel = useCallback((e) => {
        const waveform = props.waveformRef.current
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            if (e.deltaY > 0) waveform.zoom.zoomOut()
            else waveform.zoom.zoomIn()
        } else if (e.shiftKey) {
            e.preventDefault()
            if (e.deltaY > 0) amplitudeScale.current = Math.max(amplitudeScale.current - 0.5, 0.5)
            else amplitudeScale.current = Math.min(amplitudeScale.current + 0.5, 5)
            waveform.views.getView('zoomview').setAmplitudeScale(amplitudeScale.current)
        } else {
            const player = props.playerRef.current
            player.seekTo(player.getCurrentTime() + (e.deltaY > 0 ? -0.5 : 0.5), 'seconds')
        }
    }, [props.waveformRef, props.playerRef])

    const ContextMenu = () => {
        const handleContextMenuItemClick = useCallback(({props: p, data}) => {
            if (data === 'add') {
                insertSegment(p.time)
            } else if (data === 'editText') {
                const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(p.segment.id)
                if (props.hotRef.current.countCols() > SCRIPT_COLUMN) {
                    props.hotRef.current.selectCell(row, SCRIPT_COLUMN)
                    props.hotRef.current.getActiveEditor().enableFullEditMode()
                    props.hotRef.current.getActiveEditor().beginEditing()
                }
            } else if (data === 'remove') {
                const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(p.segment.id)
                props.hotRef.current.alter('remove_row', row, 1)
            } else if (data === 'playSegment') {
                props.playerRef.current.seekTo(p.segment.startTime, 'seconds')
                props.playerRef.current.getInternalPlayer().play()
            }
        }, [])

        if (contextMenuSegment) {
            return <Menu id={contextMenuId} animation={false} onContextMenu={(e) => e.preventDefault()}>
                <Item onClick={handleContextMenuItemClick} data={'editText'}>텍스트 수정</Item>
                <Item onClick={handleContextMenuItemClick} data={'remove'}>삭제</Item>
                <Item onClick={handleContextMenuItemClick} data={'playSegment'}>선택 자막 위치 재생</Item>
            </Menu>
        } else {
            return <Menu id={contextMenuId} animation={false} onContextMenu={(e) => e.preventDefault()}>
                <Item onClick={handleContextMenuItemClick} data={'add'}>추가</Item>
            </Menu>

        }
    }

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
            segmentOptions: {overlay: true, overlayOpacity: 0.4, overlayLabelColor: 'white'},
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
                peaks.on("segments.mouseenter", (event) => {
                    moveCursorRef.current = event.evt.target
                    moveCursorRef.current.style.cursor = 'move'
                })
                peaks.on("segments.mouseleave", () => {
                    moveCursorRef.current.style.cursor = 'default'
                })
                peaks.on("segments.dragged", (event) => {
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    const startElement = props.hotRef.current.getCell(row, 0)
                    const endElement = props.hotRef.current.getCell(row, 1)
                    const [start, end] = [secToTc(event.segment.startTime), secToTc(event.segment.endTime)]
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
                    const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(event.segment.id)
                    const [prevStart, prevEnd] = [props.hotRef.current.getDataAtCell(row, 0), props.hotRef.current.getDataAtCell(row, 1)]
                    const cells = []
                    if (prevStart !== secToTc(event.segment.startTime)) cells.push([row, 0, secToTc(Math.min(event.segment.startTime, event.segment.endTime - 0.001))])
                    if (prevEnd !== secToTc(event.segment.endTime)) cells.push([row, 1, secToTc(Math.max(event.segment.endTime, event.segment.startTime + 0.001))])
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
                peaks.on('peaks.ready', () => {
                    setInitialized(true)
                    if (!props.playerRef.current.getInternalPlayer()?.src.startsWith(props.video)) {
                        props.waveformRef.current?.destroy()
                        props.waveformRef.current = null
                    } else setStatusDisplay('loaded')
                    zoomviewContainerRef.current.addEventListener('wheel', onWheel, {passive: false})
                    // zoomviewContainerRef.current.setAttribute('tabindex', 0)
                })
                let isDoubleClick = false;
                let clickTimer;
                peaks.on('zoomview.click', (event) => {
                    if (event.evt.button !== 0) return
                    props.playerRef.current.getInternalPlayer().pause()
                    props.playerRef.current.seekTo(event.time, 'seconds')
                    if (!isDoubleClick) {
                        isDoubleClick = true
                        clickTimer = setTimeout(() => {
                            isDoubleClick = false;
                            if (event.evt.ctrlKey || event.evt.metaKey) insertSegment(event.time)
                        }, 300);
                    } else {
                        clearTimeout(clickTimer)
                        isDoubleClick = false
                        const segment = peaks.segments.find(event.time, event.time)[0]
                        if (segment) {
                            const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(segment.id)
                            const select = [[row, 0, row, props.hotRef.current.countCols() - 1]]
                            if (props.hotRef.current.countCols() > SCRIPT_COLUMN) select.push([row, SCRIPT_COLUMN])
                            props.hotRef.current.selectCells(select)
                            if (select.length === 2) {
                                props.hotRef.current.getActiveEditor().enableFullEditMode()
                                props.hotRef.current.getActiveEditor().beginEditing()
                            }
                        }
                    }
                })

                amplitudeScale.current = 2
                peaks.views.getView('zoomview')?.setAmplitudeScale(amplitudeScale.current)
                peaks.views.getView('zoomview')?.setSegmentDragMode('no-overlap')
                peaks.views.getView('zoomview')?.enableSegmentDragging(true)
                peaks.views.getView('zoomview')?.enableSeek(false)
            }
        })
        return () => {
            props.waveformRef.current?.destroy()
            props.waveformRef.current = null
            props.selectedSegment.current = null
            window.removeEventListener('error', errorHandler)
        }
    }, [props.video, props.waveformRef, insertSegment, onWheel, errorHandler, props.hotRef, props.playerRef, props.tcLockRef, props.selectedSegment])

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

    useEffect(() => {
        if (initialized) {
            setInitialized(false)
            if (props.waveformRef.current) {
                props.waveformRef.current.segments.removeAll()
                props.waveformRef.current.segments.add(resetSegments())
                props.waveformRef.current.on('zoomview.contextmenu', (event) => {
                    setContextMenuSegment(null)
                    const segment = props.waveformRef.current.segments.find(event.time, event.time)[0]
                    if (segment) {
                        const row = props.hotRef.current.getSourceDataAtCol('rowId').indexOf(segment.id)
                        props.hotRef.current.selectRows(row)
                        setContextMenuSegment(segment)
                        contextMenuShow({event: event.evt, props: {segment: segment}})
                    } else {
                        contextMenuShow({event: event.evt, props: {time: event.time}})
                    }
                })
            }
        }
    }, [initialized, contextMenuShow, props.waveformRef, props.hotRef, resetSegments])

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
        <ContextMenu/>
    </>
};

export default TimelineWindow
