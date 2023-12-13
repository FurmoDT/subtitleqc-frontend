import {MDBBtn, MDBInput, MDBTooltip} from "mdb-react-ui-kit";
import LanguagesModal from "./dialogs/LanguagesModal";
import {TbArrowsJoin2, TbArrowsSplit2, TbClockMinus, TbClockPlus} from "react-icons/tb";
import {secToTc, splitLine, tcToSec} from "../../../utils/functions";
import {useState} from "react";
import FindPopover from "./dialogs/FindPopover";
import ReplacePopover from "./dialogs/ReplacePopover";
import {BsFillSunriseFill, BsSun, BsSunrise, BsSunset} from "react-icons/bs";
import axios from "../../../utils/axios";
import {GrDocumentSound} from "react-icons/gr";
import {AiOutlineInsertRowAbove, AiOutlineInsertRowBelow} from "react-icons/ai";
import {RiDeleteRow} from "react-icons/ri";

const TransToolbar = (props) => {
    const [isTranslating, setIsTranslating] = useState(false)

    return <div className={'d-flex flex-row align-items-center mx-1'} style={{height: '2.5rem'}}>
        <MDBInput type='number' defaultValue={14} min={10} max={25} size={'sm'}
                  wrapperStyle={{width: '3.5rem', minWidth: '3.5rem'}}
                  onChange={(event) => props.setHotFontSize(Math.max(Math.min(parseInt(event.target.value), 25), 10) + 'px')}/>
        <LanguagesModal languages={props.languages} setLanguages={props.setLanguages}/>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Speech To Text'>
            <MDBBtn className={'transToolbar-button'} disabled={true} color={'link'} size={'sm'} onClick={() => {
                // axios.get(`https://s3.subtitleqc.ai/task/demo/stt.json`, {headers: {Authorization: null}}).then((response) => {
                //     setTimeout(() => {
                //         props.cellDataRef.current = response.data.cells
                //         props.setLanguages(response.data.languages)
                //     }, 13000)
                // }).catch(() => null)
            }}><GrDocumentSound color={'black'} size={20}/></MDBBtn></MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Translate'>
            <MDBBtn className={'transToolbar-button'} disabled={/*isTranslating*/true} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.hotRef.current.colToProp(2).startsWith('koKR') && !Number.isInteger(props.hotRef.current.propToCol('spns_1'))) {
                            setIsTranslating(true)
                            axios.post('v1/task/spns/subtitle_translation', {inputs: props.hotRef.current.getDataAtCol(2).map(value => value ? value : '')}).then((response) => {
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
                    }}><BsFillSunriseFill color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC In & Out'>
            <MDBBtn ref={props.tcIoButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const row = props.hotSelectionRef.current.rowStart
                        const tc = secToTc(props.playerRef.current?.getCurrentTime())
                        if (row != null) {
                            props.hotRef.current.setDataAtCell([[row, 0, tc], ...(row - 1 < 0 ? [] : [[row - 1, 1, tc]])])
                            props.hotRef.current.selectCell(row + 1, 0)
                        }
                    }}><BsSun color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC In'>
            <MDBBtn ref={props.tcInButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const row = props.hotSelectionRef.current.rowStart
                        if (row != null) {
                            props.hotRef.current.setDataAtCell([[row, 0, secToTc(props.playerRef.current?.getCurrentTime())], [row, 1, secToTc(props.playerRef.current?.getCurrentTime() + 1)]])
                            props.hotRef.current.selectCell(row, 0)
                        }
                    }}><BsSunrise color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC Out'>
            <MDBBtn ref={props.tcOutButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const row = props.hotSelectionRef.current.rowStart
                        if (row != null) {
                            props.hotRef.current.setDataAtCell(row, 1, secToTc(props.playerRef.current?.getCurrentTime()))
                            props.hotRef.current.selectCell(row + 1, 0)
                        }
                    }}><BsSunset color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC 값 증가'>
            <MDBBtn ref={props.tcIncreaseButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const {rowStart, columnStart, rowEnd, columnEnd} = props.hotSelectionRef.current
                        if (rowStart === null) return
                        const pairs = [];
                        for (let row = rowStart; row <= rowEnd; row++) {
                            for (let col = columnStart; col <= Math.min(columnEnd, 1); col++) {
                                pairs.push([row, col, secToTc(tcToSec(props.hotRef.current.getDataAtCell(row, col)) + 0.2)])
                            }
                        }
                        props.hotRef.current.setDataAtCell(pairs)
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><TbClockPlus size={20} color={'black'}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC 값 감소'>
            <MDBBtn ref={props.tcDecreaseButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        if (props.tcLockRef.current) return
                        const {rowStart, columnStart, rowEnd, columnEnd} = props.hotSelectionRef.current
                        if (rowStart === null) return
                        const pairs = [];
                        for (let row = rowStart; row <= rowEnd; row++) {
                            for (let col = columnStart; col <= Math.min(columnEnd, 1); col++) {
                                pairs.push([row, col, secToTc(tcToSec(props.hotRef.current.getDataAtCell(row, col)) - 0.2)])
                            }
                        }
                        props.hotRef.current.setDataAtCell(pairs)
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><TbClockMinus size={20} color={'black'}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Split Line'>
            <MDBBtn ref={props.splitLineButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const selection = props.hotSelectionRef.current
                        if (selection.rowStart !== null) {
                            const selectedData = props.hotRef.current.getDataAtRow(selection.rowStart)
                            props.hotRef.current.alter('insert_row', selection.rowStart + 1, 1)
                            const mid = secToTc(tcToSec(selectedData[0]) + Number(((tcToSec(selectedData[1]) - tcToSec(selectedData[0])) / 2).toFixed(3)))
                            props.hotRef.current.setDataAtCell([[selection.rowStart, 1, mid], [selection.rowStart + 1, 0, mid], [selection.rowStart + 1, 1, selectedData[1]], ...Array.from({length: props.hotRef.current.countCols() - 4}, (_, colIndex) => {
                                const lines = splitLine(selectedData[4 + colIndex])
                                return [[selection.rowStart, colIndex + 4, lines[0]], [selection.rowStart + 1, colIndex + 4, lines[1]]]
                            }).flat()])
                            props.hotRef.current.selectCell(selection.rowStart + 1, selection.columnStart)
                        }
                    }}><TbArrowsSplit2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Merge Line'>
            <MDBBtn ref={props.mergeLineButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const selection = props.hotSelectionRef.current
                        const countCols = props.hotRef.current.countCols()
                        const selectedData = props.hotRef.current.getData(selection.rowStart, 0, selection.rowEnd, countCols)
                        if (selectedData.length <= 1) {
                            if (selection.rowStart !== null && selection.rowEnd !== null) props.hotRef.current.selectCell(selection.rowStart, selection.columnEnd)
                            return
                        }
                        const result = [];
                        for (let i = 4; i < countCols; i++) {
                            const colValues = selectedData.map(row => row[i]);
                            result.push(colValues.join(' '));
                        }
                        props.hotRef.current.setDataAtCell([[selection.rowStart, 1, selectedData[selectedData.length - 1][1]],
                            ...result.map((value, index) => [selection.rowStart, index + 4, value]),
                            ...Array.from({length: selection.rowEnd - selection.rowStart}, (_, rowIndex) => Array.from({length: countCols}, (_, colIndex) => [selection.rowStart + 1 + rowIndex, colIndex, ''])).flat()
                        ])
                        props.hotRef.current.alter('remove_row', selection.rowStart + 1, selection.rowEnd - selection.rowStart)
                        props.hotRef.current.selectCell(selection.rowStart, selection.columnEnd)
                    }}><TbArrowsJoin2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='위에 줄 추가'>
            <MDBBtn ref={props.insertLineAboveButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const {rowStart, columnStart, rowEnd, columnEnd} = props.hotSelectionRef.current
                        if (rowStart === null) return
                        props.hotRef.current.alter('insert_row', rowStart, 1)
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><AiOutlineInsertRowAbove color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='아래 줄 추가'>
            <MDBBtn ref={props.insertLineBelowButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const {rowStart, columnStart, rowEnd, columnEnd} = props.hotSelectionRef.current
                        if (rowStart === null) return
                        props.hotRef.current.alter('insert_row', rowStart + 1, 1)
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><AiOutlineInsertRowBelow color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 삭제'>
            <MDBBtn ref={props.removeLineButtonRef} className={'transToolbar-button'} color={'link'} size={'sm'}
                    onClick={() => {
                        const {rowStart, columnStart, rowEnd, columnEnd} = props.hotSelectionRef.current
                        if (rowStart === null) return
                        props.hotRef.current.alter('remove_row', rowStart, rowEnd + 1 - rowStart)
                        props.hotRef.current.selectCell(rowStart, columnStart, rowEnd, columnEnd)
                    }}><RiDeleteRow color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <div className={'transToolbar-vertical-divider'}/>
        <FindPopover findButtonRef={props.findButtonRef} hotRef={props.hotRef}
                     afterRenderPromise={props.afterRenderPromise}/>
        <ReplacePopover replaceButtonRef={props.replaceButtonRef} hotRef={props.hotRef}
                        afterRenderPromise={props.afterRenderPromise}/>
    </div>
};

export default TransToolbar
