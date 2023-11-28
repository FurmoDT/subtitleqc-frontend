import {MDBDropdown, MDBDropdownItem, MDBDropdownMenu, MDBDropdownToggle, MDBIcon, MDBTooltip} from "mdb-react-ui-kit";
import {toSrt} from "../../../utils/fileParser";
import {downloadCsv, downloadFspx, downloadSrt, downloadXlsx} from "../../../utils/fileDownload";
import NewProjectModal from "./dialogs/NewProjectModal";
import ShortcutModal from "./dialogs/ShorcutModal";
import ProjectSettingModal from "./dialogs/ProjectSettingModal";
import {useEffect, useState} from "react";

const MenuToolbar = (props) => {
    const [onlineUsers, setOnlineUsers] = useState({})

    useEffect(() => {
        if (!props.crdtInitialized) return
        const awareness = props.crdt.awareness()
        setOnlineUsers({[props.crdt.yDoc().clientID]: awareness.getLocalState()})
        awareness.on('change', ({added, removed}) => {
            const states = awareness.getStates()
            added.forEach(id => setOnlineUsers(prevState => ({...prevState, [id]: states.get(id)})))
            removed.forEach(id => {
                setOnlineUsers(prevState => {
                    const {[id]: omit, ...newState} = prevState
                    return newState
                })
            })
        })
    }, [props.crdt, props.crdtInitialized]);

    const OnlineUsersComponent = () => {
        return onlineUsers && Object.keys(onlineUsers).map(key => onlineUsers[key].user).sort((a, b) => a.connectedAt - b.connectedAt)
            .filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))
            .map(value => {
                return <MDBTooltip key={value.connectedAt} tag='span' wrapperClass='span-avatar mx-1'
                                   placement={'bottom'} title={value.name}>
                    <span>{value.email.slice(0, 3)}</span>
                </MDBTooltip>
            })
    }

    return <div className={'menu-toolbar'}>
        <div className={'d-flex w-100'}>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Project Setting'>
                <ProjectSettingModal projectDetail={props.projectDetail} setProjectDetail={props.setProjectDetail}/>
            </MDBTooltip>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='New Project'>
                <NewProjectModal setProjectDetail={props.setProjectDetail} hotRef={props.hotRef}
                                 setTcLock={props.setTcLock}
                                 setMediaFile={props.setMediaFile} setMediaInfo={props.setMediaInfo}
                                 setLanguages={props.setLanguages} cellDataRef={props.cellDataRef}
                                 setLanguageFile={props.setLanguageFile} waveformRef={props.waveformRef}/>
            </MDBTooltip>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Shortcut'>
                <ShortcutModal focusedRef={props.focusedRef} hotRef={props.hotRef} playerRef={props.playerRef}
                               waveformRef={props.waveformRef}
                               findButtonRef={props.findButtonRef} replaceButtonRef={props.replaceButtonRef}
                               tcOffsetButtonRef={props.tcOffsetButtonRef} tcIoButtonRef={props.tcIoButtonRef}
                               tcInButtonRef={props.tcInButtonRef} tcOutButtonRef={props.tcOutButtonRef}
                               splitLineButtonRef={props.splitLineButtonRef}
                               mergeLineButtonRef={props.mergeLineButtonRef}/>
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
                        })
                    }}>.fspx</MDBDropdownItem>
                    <MDBDropdownItem link onClick={() => {
                        props.languages.forEach((value) => {
                            downloadSrt({
                                name: `${props.projectDetail.name}(${value.name})`,
                                subtitle: toSrt(props.cellDataRef.current, `${value.code}_${value.counter}`)
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
                        downloadXlsx({
                            name: props.projectDetail.name || '-',
                            language: language,
                            subtitle: props.cellDataRef.current.map(obj => (['start', 'end'].concat(language)).map(key => obj[key])),
                        })
                    }}>.xlsx</MDBDropdownItem>
                    <MDBDropdownItem link onClick={() => {
                        const language = props.languages.map(value => `${value.code}_${value.counter}`)
                        downloadCsv({
                            name: props.projectDetail.name || '-',
                            language: language,
                            subtitle: props.cellDataRef.current.map(obj => (['start', 'end'].concat(language)).map(key => `"${obj[key]?.replaceAll('"', '""')}"`).join(',')).join('\n')
                        })
                    }}>.csv</MDBDropdownItem>
                </MDBDropdownMenu>
            </MDBDropdown>
        </div>
        <div className={'w-100 d-flex justify-content-center'}>
            <span className={'mx-1 fw-bold text-nowrap'} style={{color: 'black'}}>{props.taskName}</span>
        </div>
        <div className={'w-100 d-flex justify-content-end'}>
            <OnlineUsersComponent/>
        </div>
    </div>
};

export default MenuToolbar
