import {MDBBtn, MDBInput, MDBTooltip} from "mdb-react-ui-kit";
import LanguagesModal from "./modals/LanguagesModal";
import {TbArrowsJoin2, TbArrowsSplit2} from "react-icons/tb";
import {FiSun, FiSunrise, FiSunset} from "react-icons/fi";
import {secToTc} from "../../utils/functions";

const TransToolbar = (props) => {
    return <div style={{
        flexDirection: 'row', display: 'flex', alignItems: 'center', height: '40px'
    }}>
        <MDBInput wrapperStyle={{marginLeft: '5px'}} style={{width: '60px'}} size={'sm'}
                  label='Font Size' type='number' defaultValue={13} min={10} max={25}
                  onChange={(event) => {
                      props.setHotFontSize(Math.max(Math.min(parseInt(event.target.value), 25), 10) + 'px')
                  }}/>
        <LanguagesModal languages={props.languages} setLanguages={props.setLanguages}/>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC IN&OUT'>
            <MDBBtn ref={props.tcIoButtonRef} color={'link'} size={'sm'} onClick={() => {
                const row = props.hotSelectionRef.current.row
                const tc = secToTc(props.playerRef.current?.getCurrentTime())
                if (row != null) {
                    props.hotRef.current.setDataAtCell([[row, 0, tc], ...(row - 1 < 0 ? [] : [[row - 1, 1, tc]])])
                    props.hotRef.current.selectCell(props.hotSelectionRef.current.row + 1, 0)
                }
            }}><FiSun color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC IN'>
            <MDBBtn ref={props.tcInButtonRef} color={'link'} size={'sm'} onClick={() => {
                const row = props.hotSelectionRef.current.row
                if (row) {
                    props.hotRef.current.setDataAtCell(row, 0, secToTc(props.playerRef.current?.getCurrentTime()))
                    props.hotRef.current.selectCell(row, 0)
                }
            }}><FiSunrise color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='TC OUT'>
            <MDBBtn ref={props.tcOutButtonRef} color={'link'} size={'sm'} onClick={() => {
                const row = props.hotSelectionRef.current.row
                if (row) {
                    props.hotRef.current.setDataAtCell(row, 1, secToTc(props.playerRef.current?.getCurrentTime()))
                    props.hotRef.current.selectCell(row + 1, 0)
                }
            }}><FiSunset color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Split Line'>
            <MDBBtn color={'link'} size={'sm'} onClick={() => {
                console.log('줄 나누기')
            }} disabled><TbArrowsSplit2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Merge Line'>
            <MDBBtn color={'link'} size={'sm'} onClick={() => {
                console.log('줄 합치기')
            }} disabled><TbArrowsJoin2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
    </div>
};

export default TransToolbar
