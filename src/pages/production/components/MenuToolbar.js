import {
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBIcon,
    MDBSpinner,
    MDBTooltip
} from "mdb-react-ui-kit";
import {toSrt, toVtt} from "../../../utils/fileParser";
import {downloadCsv, downloadFspx, downloadSrt, downloadVtt, downloadXlsx} from "../../../utils/fileDownload";
import NewProjectModal from "./dialogs/NewProjectModal";
import ShortcutModal from "./dialogs/ShorcutModal";
import ProjectSettingModal from "./dialogs/ProjectSettingModal";
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import SubmitModal from "../components/dialogs/SubmitModal";
import {BsCloudCheck} from "react-icons/bs";
import {formatTimestamp} from "../../../utils/functions";
import {workType} from "../../../utils/config";

const MenuToolbar = forwardRef((props, ref) => {
    const [onlineUsers, setOnlineUsers] = useState({})
    const saveStatusDivRef = useRef(null)
    const [isSaving, setIsSaving] = useState(false)
    const saveStatusTimeoutRef = useRef(null)

    useImperativeHandle(ref, () => ({
        showSavingStatus
    }))

    const showSavingStatus = (isSync) => {
        if (saveStatusDivRef.current) {
            clearTimeout(saveStatusTimeoutRef.current)
            saveStatusDivRef.current.style.display = 'inline-flex'
        }
        if (isSync) {
            setIsSaving(false)
            saveStatusTimeoutRef.current = setTimeout(() => {
                if (saveStatusDivRef.current) saveStatusDivRef.current.style.display = 'none'
            }, 3000)
        } else {
            setIsSaving(true)
            saveStatusTimeoutRef.current = setTimeout(() => {
                setIsSaving(false)
                saveStatusTimeoutRef.current = setTimeout(() => {
                    if (saveStatusDivRef.current) saveStatusDivRef.current.style.display = 'none'
                }, 3000)
            }, 2000)
        }
    }

    useEffect(() => {
        if (props.crdtAwarenessInitialized) {
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
        } else {
            setOnlineUsers({})
        }
    }, [props.crdtAwarenessInitialized, props.crdt]);

    const OnlineUsersComponent = () => {
        return onlineUsers && Object.keys(onlineUsers).map(key => onlineUsers[key].user).sort((a, b) => a.connectedAt - b.connectedAt)
            .filter((obj, index, self) => index === self.findIndex((o) => o.id === obj.id))
            .map(value => (
                <MDBTooltip key={value.connectedAt} tag='span' wrapperClass='span-avatar mx-1' placement={'bottom'}
                            wrapperProps={{style: {outline: `3px solid ${value.color}`}}} title={value.name}>
                    <span>{value.email.slice(0, 3)}</span>
                </MDBTooltip>))
    }

    return <div className={'menu-toolbar'}>
        <div className={'d-flex w-100'}>
            {!props.taskHashedId &&
                <MDBTooltip tag='span' wrapperClass='d-inline-block' title='프로젝트 설정'>
                    <ProjectSettingModal projectDetail={props.projectDetail} setProjectDetail={props.setProjectDetail}/>
                </MDBTooltip>
            }
            {!props.taskHashedId &&
                <MDBTooltip tag='span' wrapperClass='d-inline-block' title='새 프로젝트'>
                    <NewProjectModal setProjectDetail={props.setProjectDetail} hotRef={props.hotRef}
                                     setTcLock={props.setTcLock}
                                     setMediaFile={props.setMediaFile} setMediaInfo={props.setMediaInfo}
                                     setLanguages={props.setLanguages} cellDataRef={props.cellDataRef}
                                     setLanguageFile={props.setLanguageFile} waveformRef={props.waveformRef}/>
                </MDBTooltip>}
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='단축키'>
                <ShortcutModal hotRef={props.hotRef} playerRef={props.playerRef} selectedSegment={props.selectedSegment}
                               findButtonRef={props.findButtonRef} replaceButtonRef={props.replaceButtonRef}
                               hotSelectionRef={props.hotSelectionRef} tcLockRef={props.tcLockRef}
                               tcOffsetButtonRef={props.tcOffsetButtonRef} tcIoButtonRef={props.tcIoButtonRef}
                               tcInButtonRef={props.tcInButtonRef} tcOutButtonRef={props.tcOutButtonRef}
                               tcIncreaseButtonRef={props.tcIncreaseButtonRef}
                               tcDecreaseButtonRef={props.tcDecreaseButtonRef}
                               insertLineAboveButtonRef={props.insertLineAboveButtonRef}
                               insertLineBelowButtonRef={props.insertLineBelowButtonRef}
                               removeLineButtonRef={props.removeLineButtonRef}
                               splitLineButtonRef={props.splitLineButtonRef}
                               mergeLineButtonRef={props.mergeLineButtonRef}/>
            </MDBTooltip>
            <MDBDropdown className={'mx-1 color-black'}>
                <MDBTooltip tag='span' wrapperClass='d-inline-block' title='다운로드'>
                    <MDBDropdownToggle color={'link'} className={'px-3'}>
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
                                name: `${props.projectDetail.name}_${value.name}`,
                                subtitle: toSrt(props.cellDataRef.current.map(v => ({
                                    start: v.start, end: v.end, text: v[`${value.code}_${value.counter}`]
                                })))
                            })
                        })
                    }}>.srt</MDBDropdownItem>
                    <MDBDropdownItem link onClick={() => {
                        props.languages.forEach((value) => {
                            downloadVtt({
                                name: `${props.projectDetail.name}_${value.name}`,
                                subtitle: toVtt(props.cellDataRef.current.map(v => ({
                                    start: v.start, end: v.end, text: v[`${value.code}_${value.counter}`]
                                })))
                            })
                        })
                    }}>.vtt</MDBDropdownItem>
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
            {props.workHashedId && !props.workEndedAt &&
                <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Submit'>
                    <SubmitModal taskHashedId={props.taskHashedId} workHashedId={props.workHashedId} fileData={{
                        projectDetail: props.projectDetail,
                        language: props.languages,
                        subtitle: props.cellDataRef.current,
                    }}/>
                </MDBTooltip>}
            <div ref={saveStatusDivRef} className={'align-items-center mx-1'}
                 style={{display: 'none', fontSize: '0.8rem'}}>
                {isSaving ? <><MDBSpinner role='status' size={'sm'} className={'mx-1'}/><span className={'text-nowrap'}>저장 중...</span></> :
                    <><BsCloudCheck size={20} className={'mx-1'}/><span className={'text-nowrap'}>저장 완료</span></>}
            </div>
        </div>
        <div className={'w-100 d-flex justify-content-center'}>
            <span className={'mx-1 fw-bold text-nowrap'} style={{color: 'black'}}>{props.projectDetail.name}</span>
            {props.workTypeKey &&
                <span className={'mx-1 text-nowrap mt-auto'} style={{color: 'black', fontSize: '0.8rem'}}>
                {workType[props.workTypeKey]}</span>}
            {props.workEndedAt &&
                <span className={'mx-1 text-nowrap mt-auto'} style={{color: 'black', fontSize: '0.8rem'}}>
                {`${formatTimestamp(props.workEndedAt)} 완료`}</span>}
            {!props.workHashedId && props.taskEndedAt &&
                <span className={'mx-1 text-nowrap mt-auto'} style={{color: 'black', fontSize: '0.8rem'}}>
                {`${formatTimestamp(props.taskEndedAt)} 완료`}</span>}
        </div>
        <div className={'w-100 d-flex justify-content-end'}>
            <OnlineUsersComponent/>
        </div>
    </div>
})

export default MenuToolbar
