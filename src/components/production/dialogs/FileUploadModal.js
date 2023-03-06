import {
    MDBBtn,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
    MDBRadio,
} from 'mdb-react-ui-kit';
import {useCallback, useEffect, useRef, useState} from "react";
import {languageCodes} from "../../../utils/config";
import {v4} from "uuid";

const FileUploadModal = (props) => {
    const toggleShow = () => {
        props.setFileUploadModalShow(!props.fileUploadModalShow)
        setNewLanguages(null)
        setSelectionActive(false)
        if (remainRadioRef.current && updateRadioRef.current) {
            remainRadioRef.current.checked = false
            updateRadioRef.current.checked = false
        }
    };
    const resetSegments = useRef(props.resetSegments)
    const [selectionActive, setSelectionActive] = useState(false)
    const [newLanguages, setNewLanguages] = useState(null)
    const remainRadioRef = useRef(null)
    const updateRadioRef = useRef(null)
    const tcRadioElement = () => {
        return <>
            <MDBRadio inputRef={remainRadioRef} name='inlineRadio' id='remainRadio' label='REMAIN' inline/>
            <MDBRadio inputRef={updateRadioRef} name='inlineRadio' id='updateRadio' label='UPDATE' inline/>
        </>
    }
    const setNewLanguagesElement = () => {
        const handleAddClick = (code, name) => {
            const counter = Math.max(...props.languageFile.prevLanguages.filter(v => v.code === code).map(v => v.counter + 1), 1)
            setNewLanguages([{code: code, name: name + (counter > 1 ? `(${counter})` : ''), counter: counter}])
        }
        const addLanguageItem = Object.entries(languageCodes).map(([key, value]) => (
            <MDBDropdownItem link key={key} onClick={() => handleAddClick(key, value)}>{value}</MDBDropdownItem>))
        addLanguageItem.splice(addLanguageItem.length - 2, 0, <MDBDropdownItem key={'languageDivider'} divider/>)
        return <MDBDropdown style={{display: 'flex', justifyContent: 'flex-end'}}>
            <MDBDropdownToggle size={'sm'} color={'link'}>SELECT LANGUAGE</MDBDropdownToggle>
            <MDBDropdownMenu>
                {addLanguageItem}
            </MDBDropdownMenu>
        </MDBDropdown>
    }
    useEffect(() => {
        if (props.languageFile) {
            if (props.languageFile.newLanguages === 'srt') {
                setSelectionActive(true)
            } else {
                setNewLanguages(props.languageFile.newLanguages)
            }
        }
    }, [props.languageFile])
    const setFile = useCallback((update) => {
        const subtitle = [];
        const l1 = (!props.fnToggleRef.current ? props.cellDataRef.current.length : props.fnRef.current.length)
        const l2 = props.languageFile.subtitle.length
        const maxLength = Math.max(l1, l2)
        for (let i = 0; i < maxLength; i++) {
            const {start: startA, end: endA, ...subtitleA} = (
                !props.fnToggleRef.current ? props.cellDataRef.current[i] : props.fnRef.current[i]
            ) || {}
            const {start: startB, end: endB, ...subtitleB} = props.languageFile.subtitle[i] || {}
            const start = update ? startB : startA
            const end = update ? endB : endA
            subtitle.push(Object.assign({}, {rowId: v4(), ...(start ? {start} : {}), ...(end ? {end} : {})}, subtitleA, subtitleB))
        }
        if (!props.fnToggleRef.current) {
            props.cellDataRef.current = subtitle
            localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            props.setLanguages(props.languageFile.prevLanguages.concat(newLanguages))
        } else {
            props.fnRef.current = subtitle
            localStorage.setItem('fn', JSON.stringify(props.fnRef.current))
            props.setFnLanguages(props.languageFile.prevLanguages.concat(newLanguages))
        }
        if (props.waveformRef.current) {
            props.waveformRef.current.segments.removeAll()
            props.waveformRef.current.segments.add(resetSegments.current())
        }
    }, [props, newLanguages])
    return <>
        <MDBModal staticBackdrop show={props.fileUploadModalShow} setShow={props.setFileUploadModalShow} tabIndex='-1'>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>FILE UPLOAD</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        LANGUAGES
                        <MDBListGroup>
                            {selectionActive ? setNewLanguagesElement() : null}
                            {newLanguages ? newLanguages.map((value, index) => <MDBListGroupItem
                                key={index}>{value.name}</MDBListGroupItem>) : null}
                        </MDBListGroup>
                        <br/>TIMECODE<br/>
                        {tcRadioElement()}
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={() => {
                            const remain = remainRadioRef.current?.checked
                            const update = updateRadioRef.current?.checked
                            if (newLanguages) {
                                if ((remain || update)) {
                                    if (props.languageFile.newLanguages === 'srt') {
                                        props.languageFile.subtitle.map(v => {
                                            v[`${newLanguages[0].code}_${newLanguages[0].counter}`] = v.srt
                                            delete v.srt
                                            return v
                                        })
                                    }
                                    toggleShow()
                                    if (remain) setFile(false)
                                    else if (update) setFile(true)
                                }
                            }
                        }}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default FileUploadModal