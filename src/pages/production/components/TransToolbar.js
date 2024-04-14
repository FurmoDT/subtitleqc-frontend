import {MDBBtn, MDBInput, MDBTooltip} from "mdb-react-ui-kit";
import LanguagesModal from "./dialogs/LanguagesModal";
import {TbArrowsJoin2, TbArrowsSplit2, TbClockMinus, TbClockPlus} from "react-icons/tb";
import {secToTc, splitLine, tcToSec} from "../../../utils/functions";
import {useCallback, useState} from "react";
import FindPopover from "./dialogs/FindPopover";
import ReplacePopover from "./dialogs/ReplacePopover";
import axios from "../../../utils/axios";
import {GrDocumentSound} from "react-icons/gr";
import {AiOutlineInsertRowAbove, AiOutlineInsertRowBelow} from "react-icons/ai";
import {RiDeleteRow} from "react-icons/ri";
import {FaHourglass, FaHourglassEnd, FaHourglassStart} from "react-icons/fa";
import {MdStart} from "react-icons/md";
import {SCRIPT_COLUMN} from "../../../utils/hotRenderer";

const TransToolbar = (props) => {
    const [isTranscribing, setIsTranscribing] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)

    const adjustedHotSelection = useCallback(() => {
        const s = props.hotSelectionRef.current
        return {
            rowStart: Math.min(s.rowStart, s.rowEnd), columnStart: Math.min(s.columnStart, s.columnEnd),
            rowEnd: Math.max(s.rowStart, s.rowEnd), columnEnd: Math.max(s.columnStart, s.columnEnd)
        }
    }, [props.hotSelectionRef])

    const adjustTcValue = useCallback((value) => {
        const {rowStart, columnStart, rowEnd, columnEnd} = adjustedHotSelection()
        if (props.tcLockRef.current || rowStart === null) return
        const pairs = [];
        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = columnStart; col <= Math.min(columnEnd, 1); col++) {
                pairs.push([row, col, secToTc(tcToSec(props.hotRef.current.getDataAtCell(row, col)) + value)])
            }
        }
        props.hotRef.current.setDataAtCell(pairs)
        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
    }, [props.hotRef, props.tcLockRef, adjustedHotSelection])

    return <div className={'d-flex flex-row align-items-center mx-1'} style={{height: '2.5rem'}}>
        <MDBInput type='number' defaultValue={14} min={10} max={25} size={'sm'}
                  wrapperStyle={{width: '3.5rem', minWidth: '3.5rem'}}
                  onChange={(event) => props.setHotFontSize(Math.max(Math.min(parseInt(event.target.value), 25), 10) + 'px')}/>
        <LanguagesModal languages={props.languages} setLanguages={props.setLanguages}/>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Speech To Text'>
            <MDBBtn className={'transToolbar-button'} disabled={!props.taskHashedId || isTranscribing} color={'link'}
                    size={'sm'} onClick={() => {
                if (window.confirm('예상 소요시간: 5분 이상')) {
                    setIsTranscribing(true)
                    axios.post('v1/tasks/stt', {hashed_id: props.taskHashedId}).then()
                }
            }}><GrDocumentSound color={'black'} size={20}/></MDBBtn></MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='번역'>
            <MDBBtn className={'transToolbar-button'} disabled={isTranslating} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.readOnly) return
                        const ko = props.hotRef.current.getDataAtCol(props.hotRef.current.propToCol('koKR_1'))
                        if (ko && !Number.isInteger(props.hotRef.current.propToCol('spns_1'))) {
                            setIsTranslating(true)
                            axios.post('v1/tasks/spns/subtitle_translation', {inputs: ko.map(value => value ? value : '')}).then((response) => {
                                props.hotRef.current.setDataAtCell((response.data.map((value, index) => ([index, props.hotRef.current.countCols() - 1, value]))))
                                setIsTranslating(false)
                            })
                            props.setLanguages(prevState => [...prevState, {code: 'spns', name: 'SPNS', counter: 1}])
                        }
                    }}><img src={'/translate-icon.png'} alt={''} width={'25'}/></MDBBtn></MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC Offset Rest'>
            <MDBBtn ref={props.tcOffsetButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current || !props.selectedSegment.current) return
                        const start = props.playerRef.current.getCurrentTime()
                        const offsetStart = props.selectedSegment.current.startTime
                        const diff = start - offsetStart
                        const oldArray = props.hotRef.current.getData(0, 0, props.hotRef.current.countRows() - 3, 1)
                        const newArray = []
                        oldArray.forEach((value, index) => {
                            const tcIn = tcToSec(value[0])
                            const tcOut = tcToSec(value[1])
                            if (tcIn >= offsetStart) newArray.push(...[[index, 0, secToTc(tcIn + diff)], [index, 1, secToTc(tcOut + diff)]])
                        })
                        props.hotRef.current.setDataAtCell(newArray)
                    }}><MdStart color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC IN & OUT'>
            <MDBBtn ref={props.tcIoButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const row = props.hotSelectionRef.current.rowStart
                        const tc = secToTc(props.playerRef.current?.getCurrentTime())
                        if (row != null) {
                            props.hotRef.current.setDataAtCell([[row, 0, tc], ...(row - 1 < 0 ? [] : [[row - 1, 1, tc]])])
                            props.hotRef.current.selectCell(row + 1, 0)
                        }
                    }}><FaHourglass color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC IN'>
            <MDBBtn ref={props.tcInButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const row = props.hotSelectionRef.current.rowStart
                        if (row != null) {
                            const currentTime = props.playerRef.current?.getCurrentTime() || 0
                            const tcOut = props.hotRef.current.getDataAtCell(row, 1)
                            const tcPair = [[row, 0, secToTc(currentTime)]]
                            !tcOut && tcPair.push([row, 1, secToTc(currentTime + 1)])
                            props.hotRef.current.setDataAtCell(tcPair)
                            props.hotRef.current.selectCell(row, 0)
                        }
                    }}><FaHourglassStart color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC OUT'>
            <MDBBtn ref={props.tcOutButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const row = props.hotSelectionRef.current.rowStart
                        if (row != null) {
                            props.hotRef.current.setDataAtCell(row, 1, secToTc(props.playerRef.current?.getCurrentTime()))
                            props.hotRef.current.selectCell(row + 1, 0)
                        }
                    }}><FaHourglassEnd color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC 값 증가'>
            <MDBBtn ref={props.tcIncreaseButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => adjustTcValue(0.2)}><TbClockPlus size={20} color={'black'}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC 값 감소'>
            <MDBBtn ref={props.tcDecreaseButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => adjustTcValue(-0.2)}><TbClockMinus size={20} color={'black'}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 나누기'>
            <MDBBtn ref={props.splitLineButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.readOnly) return
                        const selection = props.hotSelectionRef.current
                        if (selection.rowStart !== null) {
                            const selectedData = props.hotRef.current.getDataAtRow(selection.rowStart)
                            props.hotRef.current.alter('insert_row', selection.rowStart + 1, 1)
                            const currentTime = props.playerRef.current.getCurrentTime()
                            const mid = tcToSec(selectedData[0]) < currentTime && currentTime < tcToSec(selectedData[1]) ? secToTc(currentTime) : secToTc(tcToSec(selectedData[0]) + Number(((tcToSec(selectedData[1]) - tcToSec(selectedData[0])) / 2).toFixed(3)))
                            props.hotRef.current.setDataAtCell([[selection.rowStart, 1, mid], [selection.rowStart + 1, 0, mid], [selection.rowStart + 1, 1, selectedData[1]], ...Array.from({length: props.hotRef.current.countCols() - SCRIPT_COLUMN}, (_, colIndex) => {
                                const lines = splitLine(selectedData[SCRIPT_COLUMN + colIndex])
                                return [[selection.rowStart, colIndex + SCRIPT_COLUMN, lines[0]], [selection.rowStart + 1, colIndex + SCRIPT_COLUMN, lines[1]]]
                            }).flat()])
                            props.hotRef.current.selectCell(selection.rowStart + 1, selection.columnStart)
                        }
                    }}><TbArrowsSplit2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 합치기'>
            <MDBBtn ref={props.mergeLineButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.readOnly) return
                        const selection = adjustedHotSelection()
                        const countCols = props.hotRef.current.countCols()
                        const selectedData = props.hotRef.current.getData(selection.rowStart, 0, selection.rowEnd, countCols)
                        if (selectedData.length > 1) {
                            const result = [];
                            for (let i = SCRIPT_COLUMN; i < countCols; i++) {
                                const colValues = selectedData.map(row => row[i]);
                                result.push(colValues.join(' '));
                            }
                            props.hotRef.current.setDataAtCell([[selection.rowStart, 1, selectedData[selectedData.length - 1][1]],
                                ...result.map((value, index) => [selection.rowStart, index + SCRIPT_COLUMN, value]),
                                ...Array.from({length: selection.rowEnd - selection.rowStart}, (_, rowIndex) => Array.from({length: countCols}, (_, colIndex) => [selection.rowStart + 1 + rowIndex, colIndex, ''])).flat()
                            ])
                            props.hotRef.current.alter('remove_row', selection.rowStart + 1, selection.rowEnd - selection.rowStart)
                        }
                        props.hotRef.current.selectCell(selection.rowStart, selection.columnEnd)
                    }}><TbArrowsJoin2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='위에 줄 추가'>
            <MDBBtn ref={props.insertLineAboveButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const {rowStart, columnStart, rowEnd, columnEnd} = adjustedHotSelection()
                        if (props.readOnly || rowStart === null) return
                        props.hotRef.current.alter('insert_row', rowStart, rowEnd - rowStart + 1)
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><AiOutlineInsertRowAbove color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='아래 줄 추가'>
            <MDBBtn ref={props.insertLineBelowButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const {rowStart, columnStart, rowEnd, columnEnd} = adjustedHotSelection()
                        if (props.readOnly || rowStart === null) return
                        props.hotRef.current.alter('insert_row', rowStart + 1, rowEnd - rowStart + 1)
                        props.hotRef.current.selectCell(rowStart + 1, columnStart, rowEnd + 1, columnEnd)
                    }}><AiOutlineInsertRowBelow color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 삭제'>
            <MDBBtn ref={props.removeLineButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const {rowStart, columnStart, rowEnd, columnEnd} = adjustedHotSelection()
                        const maxLength = props.hotRef.current.countRows()
                        if (props.readOnly || rowStart === null || maxLength === 1) return
                        const length = rowEnd + 1 - rowStart
                        props.hotRef.current.alter('remove_row', rowStart, Math.min(length, maxLength - 1))
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><RiDeleteRow color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <FindPopover findButtonRef={props.findButtonRef} hotRef={props.hotRef}
                     afterRenderPromise={props.afterRenderPromise}/>
        <ReplacePopover replaceButtonRef={props.replaceButtonRef} hotRef={props.hotRef} readOnly={props.readOnly}
                        afterRenderPromise={props.afterRenderPromise}/>
    </div>
};

export default TransToolbar
