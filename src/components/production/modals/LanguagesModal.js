import React, {useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBIcon,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';
import {ReactSortable} from "react-sortablejs";
import {languageCodes} from "../../../utils/config";

const LanguagesModal = (props) => {
    const [languages, setLanguages] = useState([])
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const languageCounter = (code) => {
        const counter = languages.filter(value => value.code === code).map(value => value.counter)
        return counter.length ? Math.max(...counter) + 1 : 1
    }
    const handleAddClick = (code, name) => {
        const counter = languageCounter(code)
        setLanguages([...languages, {
            code: code, name: name + (counter > 1 ? `(${counter})` : ''), counter: counter
        }])
    }
    useEffect(() => {
        setLanguages([...props.languages.map((value) => (Object.assign({}, value)))])
    }, [props.languages])
    return <>
        <MDBBtn style={{marginLeft: '5px'}} size={'sm'} onClick={toggleShow}>LANGUAGES</MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Languages</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <MDBDropdown style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <MDBDropdownToggle size={'sm'} color={'link'}>Add Languages</MDBDropdownToggle>
                            <MDBDropdownMenu>
                                {Object.entries(languageCodes).map(([key, value]) => (
                                    <MDBDropdownItem link key={key} onClick={() => handleAddClick(key, value)}>{value}
                                    </MDBDropdownItem>)
                                )}
                            </MDBDropdownMenu>
                        </MDBDropdown>
                        <ReactSortable animation={200} easing={"ease-out"} list={languages} setList={setLanguages}>
                            {languages.map((item) => {
                                return <div style={{
                                    borderBottom: 'solid', borderWidth: 'thin', margin: '10px', paddingLeft: '3px',
                                    fontSize: '15px', display: 'flex', alignItems: 'center'
                                }} key={`${item.code}_${item.counter}`}>{item.name}
                                    <MDBIcon fas icon="bars" style={{cursor: 'pointer', marginLeft: 'auto'}}/>
                                </div>
                            })}
                        </ReactSortable>
                        <MDBDropdown style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <MDBDropdownToggle size={'sm'} color={'link'}>Remove Languages</MDBDropdownToggle>
                            <MDBDropdownMenu>
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
                                code: value.code,
                                name: value.name,
                                counter: value.counter
                            }))])
                        }}>Save changes</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default LanguagesModal