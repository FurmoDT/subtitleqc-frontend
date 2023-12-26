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
import {languageCodes} from "../../../../utils/config";
import {v4} from "uuid";

const FileUploadModal = ({resetSegments, setLanguages, ...props}) => {
    const [selectionActive, setSelectionActive] = useState(false)
    const [newLanguages, setNewLanguages] = useState([])
    const [newSubtitle, setNewSubtitle] = useState(null)
    const remainRadioRef = useRef(null)
    const updateRadioRef = useRef(null)
    const toggleShow = () => props.setFileUploadModalShow(prevState => !prevState)
    const tcRadioElement = () => {
        return <>
            <MDBRadio inputRef={remainRadioRef} name='inlineRadio' id='remainRadio' label='REMAIN' inline/>
            <MDBRadio inputRef={updateRadioRef} name='inlineRadio' id='updateRadio' label='UPDATE' inline/>
        </>
    }
    const SetNewLanguagesComponent = () => {
        const handleAddClick = (code, name) => {
            const counter = Math.max(...props.languages.filter(v => v.code === code).map(v => v.counter + 1), 1)
            setNewLanguages([{
                code: code, name: name + (counter > 1 ? `(${counter})` : ''), counter: counter
            }])
        }
        const addLanguageItem = Object.entries(languageCodes).map(([key, value]) => (
            <MDBDropdownItem link key={key} onClick={() => handleAddClick(key, value)}>{value}</MDBDropdownItem>))
        addLanguageItem.splice(addLanguageItem.length - 2, 0, <MDBDropdownItem key={'languageDivider'} divider/>)
        return <MDBDropdown className={'d-flex justify-content-end'}>
            <MDBDropdownToggle size={'sm'} color={'link'}>SELECT LANGUAGE</MDBDropdownToggle>
            <MDBDropdownMenu>{addLanguageItem}</MDBDropdownMenu>
        </MDBDropdown>
    }

    useEffect(() => {
        if (!props.fileUploadModalShow && remainRadioRef.current && updateRadioRef.current) {
            setNewSubtitle(null)
            setNewLanguages([])
            setSelectionActive(false)
            remainRadioRef.current.checked = updateRadioRef.current.checked = false
        }
    }, [props.fileUploadModalShow]);

    useEffect(() => {
        if (props.languageFile) {
            if (props.languageFile.newLanguages === undefined) setSelectionActive(true)
            else setNewLanguages(props.languageFile.newLanguages)
        }
    }, [props.languageFile])

    const setFile = useCallback((update) => {
        const subtitle = [];
        const l1 = props.cellDataRef.current.length
        const l2 = newSubtitle.length
        const maxLength = Math.max(l1, l2)
        for (let i = 0; i < maxLength; i++) {
            const {start: startA, end: endA, ...subtitleA} = props.cellDataRef.current[i] || {}
            const {start: startB, end: endB, ...subtitleB} = newSubtitle[i] || {}
            const start = update ? startB : startA
            const end = update ? endB : endA
            subtitle.push(Object.assign({}, {rowId: v4(), ...(start ? {start} : {}), ...(end ? {end} : {})}, subtitleA, subtitleB))
        }
        props.cellDataRef.current = subtitle
        localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
        setLanguages(prevState => prevState.concat(newLanguages))
        if (props.waveformRef.current) {
            props.waveformRef.current.segments.removeAll()
            props.waveformRef.current.segments.add(resetSegments())
        }
    }, [newLanguages, resetSegments, props.cellDataRef, props.waveformRef, setLanguages, newSubtitle])

    useEffect(() => {
        if (newSubtitle) setFile(!updateRadioRef.current.checked)
    }, [newSubtitle, setFile])

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
                            {selectionActive && <SetNewLanguagesComponent/>}
                            {newLanguages.map((value, index) =>
                                <MDBListGroupItem key={index}>{value.name}</MDBListGroupItem>)}
                        </MDBListGroup>
                        <br/>TIMECODE<br/>
                        {tcRadioElement()}
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={() => {
                            if (newLanguages.length && (remainRadioRef.current.checked || updateRadioRef.current.checked)) {
                                setNewSubtitle(props.languageFile.newLanguages === undefined ? props.languageFile.subtitle.map(v => ({
                                    start: v.start,
                                    end: v.end,
                                    [`${newLanguages[0].code}_${newLanguages[0].counter}`]: v.text
                                })) : props.languageFile.subtitle)
                                toggleShow()
                            }
                        }}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default FileUploadModal