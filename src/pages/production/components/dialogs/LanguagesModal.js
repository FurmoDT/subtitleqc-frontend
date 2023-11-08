import React, {useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
    MDBTooltip,
} from 'mdb-react-ui-kit';
import {ReactSortable} from "react-sortablejs";
import {languageCodes} from "../../../../utils/config";
import {GrLanguage} from "react-icons/gr";
import {FaBars} from "react-icons/fa";

const LanguagesModal = (props) => {
    const [languages, setLanguages] = useState([])
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const addLanguageItem = Object.entries(languageCodes).map(([key, value]) => (
        <MDBDropdownItem link key={key} onClick={() => handleAddClick(key, value)}>{value}</MDBDropdownItem>))

    addLanguageItem.splice(addLanguageItem.length - 2, 0, <MDBDropdownItem key={'languageDivider'} divider/>)

    const languageCounter = (code) => {
        const counter = languages.filter(value => value.code === code).map(value => value.counter)
        return counter.length ? Math.max(...counter) + 1 : 1
    }

    const handleAddClick = (code, name) => {
        const counter = languageCounter(code)
        setLanguages([...languages, {
            code: code,
            name: name + (counter > 1 ? `(${counter})` : ''),
            counter: counter
        }])
    }

    useEffect(() => {
        setLanguages([...props.languages.map((value) => (Object.assign({}, value)))])
    }, [props.languages])

    return <>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Languages'>
            <MDBBtn className={'ms-1'} size={'sm'} color={'link'} onClick={toggleShow}>
                <GrLanguage color={'black'} size={19}/>
            </MDBBtn>
        </MDBTooltip>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Languages</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <MDBDropdown className={'d-flex justify-content-end'}>
                            <MDBDropdownToggle size={'sm'} color={'link'}>Add Languages</MDBDropdownToggle>
                            <MDBDropdownMenu style={{minWidth: '9rem'}}>{addLanguageItem}</MDBDropdownMenu>
                        </MDBDropdown>
                        <ReactSortable animation={200} easing={"ease-out"} list={languages} setList={setLanguages}>
                            {languages.map((item) => {
                                return <div className={'d-flex align-items-center m-2 ps-1'}
                                            style={{borderBottom: 'solid', borderWidth: 'thin', fontSize: '0.9rem'}}
                                            key={`${item.code}_${item.counter}`}>{item.name}
                                    <FaBars className={'ms-auto'} style={{cursor: 'pointer'}}/>
                                </div>
                            })}
                        </ReactSortable>
                        <MDBDropdown className={'d-flex justify-content-end'}>
                            <MDBDropdownToggle size={'sm'} color={'link'}>Remove Languages</MDBDropdownToggle>
                            <MDBDropdownMenu style={{minWidth: '10.5rem'}}>
                                {languages.map((item, index) => {
                                    return <MDBDropdownItem key={`${item.code}_${item.counter}`} link onClick={() => {
                                        const removed = [...languages]
                                        removed.splice(index, 1)
                                        setLanguages(removed)
                                    }}>{item.name}</MDBDropdownItem>
                                })}
                            </MDBDropdownMenu>
                        </MDBDropdown>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={() => {
                            toggleShow()
                            setLanguages([...props.languages])
                        }}>Close</MDBBtn>
                        <MDBBtn onClick={() => {
                            toggleShow()
                            props.setLanguages([...languages.map((value) => ({
                                code: value.code, name: value.name, counter: value.counter
                            }))])
                        }}>Save changes</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default LanguagesModal