import React, {useState} from 'react';
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
} from 'mdb-react-ui-kit';
import {ReactSortable} from "react-sortablejs";

const LanguagesModal = (props) => {
    const [languages, setLanguages] = useState([...props.languages])
    const [idCounter, setIdCounter] = useState(languages.length);
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const languageCounter = (code) => {
        const counter = languages.filter(value => value.code === code).map(value => value.counter)
        return counter.length ? Math.max(...counter) + 1 : 1
    }
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
                                <MDBDropdownItem link onClick={() => {
                                    const counter = languageCounter('koKR')
                                    setLanguages([...languages, {
                                        id: idCounter,
                                        code: 'koKR',
                                        name: '한국어' + (counter > 1 ? `(${counter})` : ''),
                                        counter: counter
                                    }])
                                    setIdCounter(idCounter + 1)
                                }}>한국어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    const counter = languageCounter('enUS')
                                    setLanguages([...languages, {
                                        id: idCounter,
                                        code: 'enUS',
                                        name: '영어' + (counter > 1 ? `(${counter})` : ''),
                                        counter: counter
                                    }])
                                    setIdCounter(idCounter + 1)
                                }}>영어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    const counter = languageCounter('zhCN')
                                    setLanguages([...languages, {
                                        id: idCounter,
                                        code: 'zhCN',
                                        name: '중국어' + (counter > 1 ? `(${counter})` : ''),
                                        counter: counter
                                    }])
                                    setIdCounter(idCounter + 1)
                                }}>중국어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    const counter = languageCounter('viVN')
                                    setLanguages([...languages, {
                                        id: idCounter,
                                        code: 'viVN',
                                        name: '베트남어' + (counter > 1 ? `(${counter})` : ''),
                                        counter: counter
                                    }])
                                    setIdCounter(idCounter + 1)
                                }}>베트남어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    const counter = languageCounter('other')
                                    setLanguages([...languages, {
                                        id: idCounter,
                                        code: 'other',
                                        name: '기타' + (counter > 1 ? `(${counter})` : ''),
                                        counter: counter
                                    }])
                                    setIdCounter(idCounter + 1)
                                }}>기타</MDBDropdownItem>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                        <ReactSortable animation={200} easing={"ease-out"} list={languages} setList={setLanguages}>
                            {languages.map((item) => {
                                return <div style={{
                                    borderBottom: 'solid', borderWidth: 'thin', margin: '10px', paddingLeft: '3px',
                                    fontSize: '15px'
                                }} key={item.id}>{item.name}</div>
                            })}
                        </ReactSortable>
                        <MDBDropdown style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <MDBDropdownToggle size={'sm'} color={'link'}>Remove Languages</MDBDropdownToggle>
                            <MDBDropdownMenu>
                                {languages.map((item, index) => {
                                    return <MDBDropdownItem key={item.id} link onClick={() => {
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
                            props.setLanguages([...languages])
                        }}>Save changes</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default LanguagesModal