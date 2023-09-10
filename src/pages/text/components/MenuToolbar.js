import {MDBBtn, MDBSpinner, MDBTooltip} from "mdb-react-ui-kit";
import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {BsCloudCheck} from "react-icons/bs";
import Select from "react-select";
import {CustomOption, customTaskLanguageStyle} from "../../../utils/customSelect";
import {MdCompare} from "react-icons/md";

const MenuToolbar = forwardRef((props, ref) => {
    const saveStatusDivRef = useRef(null)
    const [isSaving, setIsSaving] = useState(true)
    let saveStatusTimer = null

    useImperativeHandle(ref, () => ({
        showSavingStatus
    }))

    const showSavingStatus = (syncedOnly) => {
        saveStatusDivRef.current.style.display = 'flex'
        clearTimeout(saveStatusTimer)
        if (syncedOnly) {
            setIsSaving(false)
            saveStatusTimer = setTimeout(() => {
                saveStatusDivRef.current.style.display = 'none'
            }, 3000)
        } else {
            setIsSaving(true)
            saveStatusTimer = setTimeout(() => {
                setIsSaving(false)
                clearTimeout(saveStatusTimer)
                saveStatusTimer = setTimeout(() => {
                    setIsSaving(true)
                    saveStatusDivRef.current.style.display = 'none'
                }, 3000)
            }, 2000)
        }
    }

    return <div className={'d-flex justify-content-between align-items-center'}
                style={{height: '40px', backgroundColor: '#b7b7b7ff'}}>
        <div style={{display: 'flex'}}>
            {!props.taskWorkId && props.targetLanguage && <div className={'mx-1'}>
                <Select styles={customTaskLanguageStyle} options={props.languageOptions} placeholder={null}
                        defaultValue={props.targetLanguage} components={{Option: CustomOption}}
                        onChange={(newValue) => {
                            props.setTargetLanguage(newValue)
                        }}/>
            </div>}
            <div style={{display: 'none', alignItems: 'center', fontSize: '0.8rem'}} ref={saveStatusDivRef}>
                {isSaving && <><MDBSpinner role='status' size={'sm'} className={'mx-1'}/>
                    <span>저장 중...</span></>}
                {!isSaving && <><BsCloudCheck size={20} className={'mx-1'}/>
                    <span>저장 완료</span></>}
            </div>
        </div>
        <div>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Show Diff'>
                <MDBBtn size={"sm"} className={'mx-1'} color={'link'}
                        onClick={() => props.setShowDiff(!props.showDiff)}>
                    <MdCompare size={25} color={'black'}>Diff</MdCompare>
                </MDBBtn>
            </MDBTooltip>
        </div>
    </div>
})

export default MenuToolbar
