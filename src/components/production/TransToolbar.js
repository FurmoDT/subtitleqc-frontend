import {MDBBtn, MDBInput, MDBTooltip} from "mdb-react-ui-kit";
import LanguagesModal from "./modals/LanguagesModal";
import {TbArrowsJoin2, TbArrowsSplit2} from "react-icons/tb";

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
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 나누기'>
            <MDBBtn color={'link'} size={'sm'} onClick={() => {
                console.log('줄 나누기')
            }} disabled><TbArrowsSplit2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='줄 합치기'>
            <MDBBtn color={'link'} size={'sm'} onClick={() => {
                console.log('줄 합치기')
            }} disabled><TbArrowsJoin2 color={'black'} size={20}/></MDBBtn>
        </MDBTooltip>
    </div>
};

export default TransToolbar
