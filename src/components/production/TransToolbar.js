import {MDBBtn, MDBBtnGroup, MDBIcon, MDBInput, MDBTooltip} from "mdb-react-ui-kit";
import LanguagesModal from "./modals/LanguagesModal";
import {TbArrowsJoin2, TbArrowsSplit2} from "react-icons/tb";
import {FiSun, FiSunrise, FiSunset} from "react-icons/fi";
import {secToTc, tcToSec} from "../../utils/functions";
import {useRef} from "react";
import {CgTranscript} from "react-icons/cg";

const TransToolbar = (props) => {
    const subtitleButtonRef = useRef(null)
    const fxButtonRef = useRef(null)
    return <div style={{
        flexDirection: 'row', display: 'flex', alignItems: 'center', height: '40px'
    }}>
        <MDBBtnGroup style={{marginLeft: '5px'}}>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='말자막'>
                <MDBBtn ref={subtitleButtonRef} size={'sm'} color={'link'} outline onClick={() => {
                    if (props.toggleFx) {
                        subtitleButtonRef.current.className = subtitleButtonRef.current.className.replace('btn-link', 'btn-outline-link')
                        fxButtonRef.current.className = fxButtonRef.current.className.replace('btn-outline-link', 'btn-link')
                        props.setToggleFx(!props.toggleFx)
                    }
                }}><MDBIcon fas icon="comments" color={'dark'}/></MDBBtn></MDBTooltip>
            <div style={{margin: '1px'}}></div>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='화면자막'>
                <MDBBtn ref={fxButtonRef} size={'sm'} color={'link'} onClick={() => {
                    if (!props.toggleFx) {
                        subtitleButtonRef.current.className = subtitleButtonRef.current.className.replace('btn-outline-link', 'btn-link')
                        fxButtonRef.current.className = fxButtonRef.current.className.replace('btn-link', 'btn-outline-link')
                        props.setToggleFx(!props.toggleFx)
                    }
                }}><CgTranscript color={'black'} size={15}/></MDBBtn></MDBTooltip>
        </MDBBtnGroup>
        <MDBInput wrapperStyle={{marginLeft: '5px'}} style={{width: '60px'}} size={'sm'}
                  label='Font Size' type='number' defaultValue={13} min={10} max={25}
                  onChange={(event) => {
                      props.setHotFontSize(Math.max(Math.min(parseInt(event.target.value), 25), 10) + 'px')
                  }}/>
        <LanguagesModal languages={props.languages} setLanguages={props.setLanguages}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC IN&OUT'>
            <MDBBtn ref={props.tcIoButtonRef} color={'link'} size={'sm'} onClick={() => {
                const row = props.hotSelectionRef.current.rowStart
                const tc = secToTc(props.playerRef.current?.getCurrentTime())
                if (row != null) {
                    props.hotRef.current.setDataAtCell([[row, 0, tc], ...(row - 1 < 0 ? [] : [[row - 1, 1, tc]])])
                    props.hotRef.current.selectCell(row + 1, 0)
                }
            }}><FiSun color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC IN'>
            <MDBBtn ref={props.tcInButtonRef} color={'link'} size={'sm'} onClick={() => {
                const row = props.hotSelectionRef.current.rowStart
                if (row) {
                    props.hotRef.current.setDataAtCell(row, 0, secToTc(props.playerRef.current?.getCurrentTime()))
                    props.hotRef.current.selectCell(row, 0)
                }
            }}><FiSunrise color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC OUT'>
            <MDBBtn ref={props.tcOutButtonRef} color={'link'} size={'sm'} onClick={() => {
                const row = props.hotSelectionRef.current.rowStart
                if (row) {
                    props.hotRef.current.setDataAtCell(row, 1, secToTc(props.playerRef.current?.getCurrentTime()))
                    props.hotRef.current.selectCell(row + 1, 0)
                }
            }}><FiSunset color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Split Line'>
            <MDBBtn ref={props.splitLineButtonRef} color={'link'} size={'sm'} onClick={() => {
                const selection = props.hotSelectionRef.current
                const selectedData = props.hotRef.current.getDataAtRow(selection.rowStart)
                props.hotRef.current.alter('insert_row', selection.rowStart + 1, 1)
                const mid = secToTc(tcToSec(selectedData[0]) + Number(((tcToSec(selectedData[1]) - tcToSec(selectedData[0])) / 2).toFixed(3)))
                props.hotRef.current.setDataAtCell([[selection.rowStart, 1, mid], [selection.rowStart + 1, 0, mid], [selection.rowStart + 1, 1, selectedData[1]]])
                props.hotRef.current.selectCell(selection.rowStart + 1, selection.columnStart)
            }}><TbArrowsSplit2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Merge Line'>
            <MDBBtn ref={props.mergeLineButtonRef} color={'link'} size={'sm'} onClick={() => {
                const selection = props.hotSelectionRef.current
                const selectedData = props.hotRef.current.getData(selection.rowStart, 0, selection.rowEnd, props.hotRef.current.countCols())
                const result = [];
                for (let i = 2; i < selectedData[0].length - 1; i++) {
                    const colValues = selectedData.map(row => row[i]);
                    result.push(colValues.join('\n'));
                }
                props.hotRef.current.setDataAtCell([[selection.rowStart, 1, selectedData[selectedData.length - 1][1]], ...result.map((value, index) => {
                    return [selection.rowStart, index + 2, value]
                })])
                props.hotRef.current.alter('remove_row', selection.rowStart + 1, selection.rowEnd - selection.rowStart)
                props.hotRef.current.selectCell(selection.rowStart, selection.columnEnd)
            }}><TbArrowsJoin2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
    </div>
};

export default TransToolbar
