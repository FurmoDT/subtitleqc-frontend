import {useCallback, useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBCol,
    MDBIcon,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
    MDBRow,
} from 'mdb-react-ui-kit';
import {TbArrowsJoin2, TbArrowsSplit2, TbClockMinus, TbClockPlus} from "react-icons/tb";
import {MdFindReplace, MdPlayCircle, MdSearch, MdStart} from "react-icons/md";
import {AiOutlineInsertRowAbove, AiOutlineInsertRowBelow} from "react-icons/ai";
import {RiDeleteRow} from "react-icons/ri";
import {FaHourglass, FaHourglassEnd, FaHourglassStart} from "react-icons/fa";

const ShortcutModal = (props) => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);

    const adjustedHotSelection = useCallback(() => {
        const s = props.hotSelectionRef.current
        return {
            rowStart: Math.min(s.rowStart, s.rowEnd), columnStart: Math.min(s.columnStart, s.columnEnd),
            rowEnd: Math.max(s.rowStart, s.rowEnd), columnEnd: Math.max(s.columnStart, s.columnEnd)
        }
    }, [props.hotSelectionRef])

    const handleKeyDown = useCallback((event) => {
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyF') {
            event.preventDefault();
            props.findButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyH') {
            event.preventDefault();
            props.replaceButtonRef.current.click()
        }
        if (event.code === 'F3') {
            event.preventDefault();
            props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime() - 10, 'seconds')
        }
        if (event.code === 'F4') {
            event.preventDefault();
            props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime() + 10, 'seconds')
        }
        if (event.code === 'F6') {
            event.preventDefault();
            const player = props.playerRef.current.getInternalPlayer()
            if (player) player.paused ? player.play() : player.pause()
        }
        if (event.code === 'F9') {
            event.preventDefault();
            props.tcOffsetButtonRef.current.click()
        }
        if (event.code === 'F10') {
            event.preventDefault();
            props.tcIoButtonRef.current.click()
        }
        if (event.code === 'F11') {
            event.preventDefault();
            props.tcInButtonRef.current.click()
        }
        if (event.code === 'F12') {
            event.preventDefault();
            if (event.shiftKey) props.mergeLineButtonRef.current.click()
            else props.tcOutButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyD') {
            event.preventDefault();
            props.splitLineButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyZ') {
            event.preventDefault()
            if (event.shiftKey) props.hotRef.current.redo()
            else props.hotRef.current.undo()
        }
        if (event.code === 'Delete') {
            if (props.focusedRef.current === props.waveformRef.current) {
                props.waveformRef.current.options.zoomview.container.dispatchEvent(new KeyboardEvent('keydown', {key: event.key}))
            }
        }
    }, [props.hotRef, props.waveformRef, props.playerRef, props.focusedRef, props.findButtonRef, props.replaceButtonRef, props.splitLineButtonRef, props.mergeLineButtonRef, props.tcOffsetButtonRef, props.tcIoButtonRef, props.tcInButtonRef, props.tcOutButtonRef])

    const handleKeyDownCapturing = useCallback((event) => {
        if (event.code === 'Space' && event.target.tagName !== 'INPUT' && (event.target.tagName !== 'TEXTAREA' || !props.hotRef.current.getActiveEditor()._opened)) {
            event.stopPropagation()
            event.preventDefault()
            const player = props.playerRef.current.getInternalPlayer()
            if (player) player.paused ? player.play() : player.pause()
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'ArrowUp') {
            event.stopPropagation()
            if (event.shiftKey) {
                const selection = props.hotSelectionRef.current
                const adjustedSelection = adjustedHotSelection()
                const data = props.hotRef.current.getData(0, adjustedSelection.columnStart, adjustedSelection.rowEnd, adjustedSelection.columnEnd)
                let targetRow = 0
                for (let i = selection.rowEnd - 1; i >= 0; i--) {
                    if (data[i].some(Boolean)) targetRow = i
                    else {
                        if (targetRow) break
                    }
                }
                props.hotRef.current.selectCell(selection.rowStart, selection.columnStart, targetRow, selection.columnEnd)
            } else if (event.target.className === 'handsontableInput') props.tcIncreaseButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'ArrowLeft') {
            event.stopPropagation()
            if (event.shiftKey) {
                const selection = props.hotSelectionRef.current
                const adjustedSelection = adjustedHotSelection()
                const data = props.hotRef.current.getData(adjustedSelection.rowStart, 0, adjustedSelection.rowEnd, adjustedSelection.columnEnd)
                const transposedData = data.reduce((r, a) => a.map((v, i) => [...(r[i] || []), v]), [])
                let targetColumn = 0
                for (let i = selection.columnEnd - 1; i >= 0; i--) {
                    if (transposedData[i].some(Boolean)) targetColumn = i
                    else {
                        if (targetColumn) break
                    }
                }
                props.hotRef.current.selectCell(selection.rowStart, selection.columnStart, selection.rowEnd, targetColumn)
            }
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'ArrowDown') {
            event.stopPropagation()
            if (event.shiftKey) {
                const selection = props.hotSelectionRef.current
                const adjustedSelection = adjustedHotSelection()
                const data = props.hotRef.current.getData(adjustedSelection.rowStart, adjustedSelection.columnStart, props.hotRef.current.countRows() - 3, adjustedSelection.columnEnd)
                let targetRow = props.hotRef.current.countRows() - 1
                for (let i = selection.rowEnd + 1; i < props.hotRef.current.countRows(); i++) {
                    if (data[i - adjustedSelection.rowStart]?.some(Boolean)) targetRow = i
                    else {
                        if (targetRow !== props.hotRef.current.countRows() - 1) break
                    }
                }
                props.hotRef.current.selectCell(selection.rowStart, selection.columnStart, targetRow, selection.columnEnd)
            } else if (event.target.className === 'handsontableInput') props.tcDecreaseButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'ArrowRight') {
            event.stopPropagation()
            if (event.shiftKey) {
                const selection = props.hotSelectionRef.current
                const adjustedSelection = adjustedHotSelection()
                const data = props.hotRef.current.getData(adjustedSelection.rowStart, adjustedSelection.columnStart, adjustedSelection.rowEnd, props.hotRef.current.countCols() - 1)
                const transposedData = data.reduce((r, a) => a.map((v, i) => [...(r[i] || []), v]), [])
                let targetColumn = props.hotRef.current.countCols() - 1
                for (let i = selection.columnEnd + 1; i < props.hotRef.current.countCols(); i++) {
                    if (transposedData[i - adjustedSelection.columnStart]?.some(Boolean)) targetColumn = i
                    else {
                        if (targetColumn !== props.hotRef.current.countCols() - 1) break
                    }
                }
                props.hotRef.current.selectCell(selection.rowStart, selection.columnStart, selection.rowEnd, targetColumn)
            }
        }
        if (event.code === 'F2') {
            event.stopPropagation()
            const segment = props.selectedSegment.current
            if (segment) {
                props.playerRef.current.seekTo(segment.startTime, 'seconds')
                props.playerRef.current.getInternalPlayer().play()
            }
        }
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'Insert') {
            props.insertLineBelowButtonRef.current.click()
        } else if (event.ctrlKey && event.code === 'Insert') {
            props.insertLineAboveButtonRef.current.click()
        }
        // temp
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyQ') {
            event.preventDefault()
            if (event.shiftKey) props.insertLineBelowButtonRef.current.click()
            else props.insertLineAboveButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'KeyA') {
            event.preventDefault()
            event.stopPropagation();
            props.mergeLineButtonRef.current.click()
        }
        // temp
        if (event.altKey && event.code === 'KeyQ') {
            event.preventDefault()
            event.stopPropagation()
            props.tcInButtonRef.current.click()
        }
        if (event.altKey && event.code === 'KeyW') {
            event.stopPropagation();
            props.tcOutButtonRef.current.click()
        }
        if ((event.ctrlKey || event.metaKey) && event.code === 'Delete') {
            event.stopPropagation()
            props.removeLineButtonRef.current.click()
        }
        if (event.shiftKey && event.key === '<') {
            if (props.hotRef.current.getActiveEditor()._opened) return
            event.preventDefault()
            event.stopPropagation()
            const internalPlayer = props.playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = Math.max(internalPlayer.playbackRate - 0.25, 0.25)
        }
        if (event.shiftKey && event.key === '>') {
            if (props.hotRef.current.getActiveEditor()._opened) return
            event.preventDefault()
            event.stopPropagation()
            const internalPlayer = props.playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = Math.min(internalPlayer.playbackRate + 0.25, 2)
        }
        if (event.shiftKey && event.key === '?') {
            if (props.hotRef.current.getActiveEditor()._opened) return
            event.preventDefault()
            event.stopPropagation()
            const internalPlayer = props.playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = 1
        }
    }, [props.hotRef, props.hotSelectionRef, adjustedHotSelection, props.playerRef, props.selectedSegment, props.insertLineAboveButtonRef, props.insertLineBelowButtonRef, props.removeLineButtonRef, props.tcIncreaseButtonRef, props.tcDecreaseButtonRef, props.mergeLineButtonRef, props.tcInButtonRef, props.tcOutButtonRef])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keydown", handleKeyDownCapturing, true);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keydown", handleKeyDownCapturing, true);
        };
    }, [handleKeyDown, handleKeyDownCapturing]);
    return <>
        <MDBBtn className={'mx-1 color-black'} size={'sm'} color={'link'} onClick={toggleShow}>
            <MDBIcon fas icon="keyboard" size={'2x'}/></MDBBtn>
        <MDBModal show={basicModal} tabIndex='-1'>
            <MDBModalDialog size={'lg'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Shortcut</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <h6 className='bg-light p-2 border-top border-bottom'>VIDEO</h6>
                        <MDBListGroup className={'mb-4'} light small>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <div>
                                            <MDBIcon fas icon="play" color={'dark'}/> / <MDBIcon fas icon="pause"
                                                                                                 color={'dark'}/>
                                        </div>
                                        SPACE , F6
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MdPlayCircle size={20} color={'black'}/> F2
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MDBIcon fas icon="angle-double-left"/> F3
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MDBIcon fas icon="angle-double-right"/> F4
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={2}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MDBIcon fas icon="angle-double-up"/> SHIFT >
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={2}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MDBIcon fas icon="angle-double-down"/> {'SHIFT <'}
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={2}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <span className={'px-1 border rounded'}>1x</span> {'SHIFT ?'}
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                        </MDBListGroup>
                        <h6 className='bg-light p-2 border-top border-bottom'>SUBTITLE</h6>
                        <MDBListGroup className={'mb-4'} light small>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MDBIcon fas icon="undo"/> CTRL Z
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MDBIcon fas icon="redo"/> CTRL SHIFT Z
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MdStart color={'black'} size={20}/> F9
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <FaHourglass color={'black'} size={20}/> F10
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <FaHourglassStart color={'black'} size={20}/> F11, Alt Q
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <FaHourglassEnd color={'black'} size={20}/> F12, Alt W
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <TbClockPlus size={20} color={'black'}/> <span>CTRL&nbsp;<b>↑</b></span>
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <TbClockMinus size={20} color={'black'}/> <span>CTRL&nbsp;<b>↓</b></span>
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol size={4}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <AiOutlineInsertRowAbove color={'black'} size={20}/> CTRL INSERT, CTRL Q
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={5}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <AiOutlineInsertRowBelow color={'black'} size={20}/>
                                        CTRL SHIFT INSERT, CTRL SHIFT Q
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <RiDeleteRow color={'black'} size={20}/> CTRL DELETE
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <TbArrowsSplit2 color={'black'} size={20}/> CTRL SHIFT D
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <TbArrowsJoin2 color={'black'} size={20}/> SHIFT F12
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MdSearch color={'black'} size={20}/> CTRL F
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        <MdFindReplace color={'black'} size={20}/> CTRL H
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                        </MDBListGroup>
                        <h6 className='bg-light p-2 border-top border-bottom'>WAVEFORM</h6>
                        <MDBListGroup className={'mb-4'} light small>
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem
                                        className='d-flex justify-content-between align-items-center px-2'>
                                        Not Supported
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                        </MDBListGroup>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={toggleShow}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ShortcutModal
