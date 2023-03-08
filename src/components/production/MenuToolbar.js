import {MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBTooltip} from "mdb-react-ui-kit";
import {toSrt} from "../../utils/fileParser";
import {downloadFspx, downloadSrt} from "../../utils/fileDownload";
import NewProjectModal from "./dialogs/NewProjectModal";
import ShortcutModal from "./dialogs/ShorcutModal";
import ProjectSettingModal from "./dialogs/ProjectSettingModal";

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
            <ProjectSettingModal/>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='New Project'>
            <NewProjectModal setLanguages={props.setLanguages} cellDataRef={props.cellDataRef}
                             setFnLanguages={props.setFnLanguages} fnRef={props.fnRef} hotRef={props.hotRef}
                             setLanguageFile={props.setLanguageFile} waveformRef={props.waveformRef}/>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Shortcut'>
            <ShortcutModal hotRef={props.hotRef} playerRef={props.playerRef} findButtonRef={props.findButtonRef}
                           tcIoButtonRef={props.tcIoButtonRef} tcInButtonRef={props.tcInButtonRef}
                           tcOutButtonRef={props.tcOutButtonRef}
                           splitLineButtonRef={props.splitLineButtonRef} mergeLineButtonRef={props.mergeLineButtonRef}/>
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
                        fnLanguage: props.fnLanguages,
                        fn: props.fnRef.current
                    })
                }}>.fspx</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    props.languages.forEach((value) => {
                        downloadSrt({
                            name: value.name,
                            subtitle: toSrt(props.cellDataRef.current, `${value.code}_${value.counter}`)
                        })
                    })
                    props.fnLanguages.forEach((value) => {
                        downloadSrt({
                            name: value.name,
                            subtitle: toSrt(props.fnRef.current, `${value.code}_${value.counter}`)
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
