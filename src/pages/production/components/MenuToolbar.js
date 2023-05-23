import {MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBTooltip} from "mdb-react-ui-kit";
import {toSrt} from "../../../utils/fileParser";
import {downloadCsv, downloadFspx, downloadSrt, downloadXlsx} from "../../../utils/fileDownload";
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
            <ProjectSettingModal projectDetail={props.projectDetail} setProjectDetail={props.setProjectDetail}/>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='New Project'>
            <NewProjectModal setProjectDetail={props.setProjectDetail} hotRef={props.hotRef} setTcLock={props.setTcLock}
                             setMediaFile={props.setMediaFile} setMediaInfo={props.setMediaInfo}
                             setLanguages={props.setLanguages} cellDataRef={props.cellDataRef}
                             setFnLanguages={props.setFnLanguages} fnRef={props.fnRef}
                             setLanguageFile={props.setLanguageFile} waveformRef={props.waveformRef}/>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Shortcut'>
            <ShortcutModal focusedRef={props.focusedRef} hotRef={props.hotRef} playerRef={props.playerRef}
                           waveformRef={props.waveformRef}
                           findButtonRef={props.findButtonRef} replaceButtonRef={props.replaceButtonRef}
                           tcOffsetButtonRef={props.tcOffsetButtonRef} tcIoButtonRef={props.tcIoButtonRef}
                           tcInButtonRef={props.tcInButtonRef} tcOutButtonRef={props.tcOutButtonRef}
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
                        projectDetail: props.projectDetail,
                        language: props.languages,
                        subtitle: props.cellDataRef.current,
                        fnLanguage: props.fnLanguages,
                        fn: props.fnRef.current
                    })
                }}>.fspx</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    props.languages.forEach((value) => {
                        downloadSrt({
                            name: `${props.projectDetail.name}(${value.name})`,
                            subtitle: toSrt(props.cellDataRef.current, `${value.code}_${value.counter}`)
                        })
                    })
                    props.fnLanguages.forEach((value) => {
                        downloadSrt({
                            name: `${props.projectDetail.name}(${value.name})`,
                            subtitle: toSrt(props.fnRef.current, `${value.code}_${value.counter}`)
                        })
                    })
                }}>.srt</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    props.languages.forEach((value) => {
                        // downloadVtt
                    })
                }} disabled>.vtt</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    const language = props.languages.map(value => `${value.code}_${value.counter}`)
                    const fnLanguage = props.fnLanguages.map(value => `${value.code}_${value.counter}`)
                    downloadXlsx({
                        name: props.projectDetail.name || '-',
                        language: language,
                        subtitle: props.cellDataRef.current.map(obj => (['start', 'end'].concat(language)).map(key => obj[key])),
                        fnLanguage: fnLanguage,
                        fn: props.fnRef.current.map(obj => (['start', 'end'].concat(language)).map(key => obj[key]))
                    })
                }}>.xlsx</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    const language = props.languages.map(value => `${value.code}_${value.counter}`)
                    downloadCsv({
                        name: props.projectDetail.name || '-',
                        language: language,
                        subtitle: props.cellDataRef.current.map(obj => (['start', 'end'].concat(language)).map(key => `"${obj[key]?.replaceAll('"', '""')}"`).join(',')).join('\n')
                    })
                    const fnLanguage = props.fnLanguages.map(value => `${value.code}_${value.counter}`)
                    downloadCsv({
                        name: `${props.projectDetail.name}FN`,
                        language: fnLanguage,
                        subtitle: props.fnRef.current.map(obj => (['start', 'end'].concat(fnLanguage)).map(key => `"${obj[key]?.replaceAll('"', '""')}"`).join(',')).join('\n')
                    })
                }}>.csv</MDBDropdownItem>
            </MDBDropdownMenu>
        </MDBDropdown>
    </div>
};

export default MenuToolbar
