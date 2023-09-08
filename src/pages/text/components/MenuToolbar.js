import {MDBBtn, MDBSpinner, MDBTooltip} from "mdb-react-ui-kit";
import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {BsCloudCheck} from "react-icons/bs";

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

    return <div style={{height: '40px', display: 'flex', alignItems: 'center', backgroundColor: '#b7b7b7ff'}}>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Show Diff'>
            <MDBBtn size={"sm"} className={'mx-1'} outline={true} disabled> - </MDBBtn>
        </MDBTooltip>
        <div style={{display: 'none', alignItems: 'center', fontSize: '0.8rem'}} ref={saveStatusDivRef}>
            {isSaving && <><MDBSpinner role='status' size={'sm'} className={'mx-1'}/>
                <span>저장 중...</span></>}
            {!isSaving && <><BsCloudCheck size={20} className={'mx-1'}/>
                <span>저장 완료</span></>}
        </div>
    </div>
})

export default MenuToolbar
