import {
    MDBBtn,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBIcon,
    MDBTooltip
} from "mdb-react-ui-kit";
import {toSrt} from "../../utils/fileParser";
import {downloadFspx, downloadSrt} from "../../utils/fileDownload";
import NewProjectModal from "./modals/NewProjectModal";

const MenuToolbar = (props) => {
    return <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 'thin',
        backgroundColor: 'lightgray'
    }}>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Project Setting'>
            <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'}>
                <MDBIcon fas icon="info-circle" size={'2x'}/>
            </MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='New Project'>
            <NewProjectModal setLanguages={props.setLanguages} cellDataRef={props.cellDataRef}
                             setFxLanguages={props.setFxLanguages} fxRef={props.fxRef} hotRef={props.hotRef}
                             waveformRef={props.waveformRef}/>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Shortcut'>
            <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} disabled>
                <MDBIcon fas icon="keyboard" size={'2x'}/>
            </MDBBtn>
        </MDBTooltip>
        <MDBDropdown>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Download'>
                <MDBDropdownToggle color={'link'}>
                    <MDBIcon fas icon='download' size={'xl'} color={'dark'}/>
                </MDBDropdownToggle>
            </MDBTooltip>
            <MDBDropdownMenu>
                <MDBDropdownItem link onClick={() => {
                    downloadFspx({
                        name: 'sample',
                        language: props.languages,
                        subtitle: props.cellDataRef.current,
                        fxLanguage: props.fxLanguages,
                        fx: props.fxRef.current
                    })
                }}>.fspx</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    props.languages.forEach((value) => {
                        downloadSrt({
                            name: value.name,
                            subtitle: toSrt(props.cellDataRef.current, `${value.code}_${value.counter}`)
                        })
                    })
                    props.fxLanguages.forEach((value) => {
                        downloadSrt({
                            name: value.name,
                            subtitle: toSrt(props.fxRef.current, `${value.code}_${value.counter}`)
                        })
                    })
                }}>.srt</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    props.languages.forEach((value) => {
                        // downloadVtt
                    })
                }} disabled>.vtt</MDBDropdownItem>
            </MDBDropdownMenu>
        </MDBDropdown>
    </div>
};

export default MenuToolbar
