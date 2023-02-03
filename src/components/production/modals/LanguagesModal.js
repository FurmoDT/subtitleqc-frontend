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
    const [languages, setLanguages] = useState(props.languages.map((value) => {
        return {code: value.code, name: value.name}
    }))
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
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
                                    setLanguages([...languages, {code: 'koKR', name: '한국어'}])
                                }}>한국어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    setLanguages([...languages, {code: 'enUS', name: '영어'}])
                                }}>영어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    setLanguages([...languages, {code: 'zhCN', name: '중국어'}])
                                }}>중국어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    setLanguages([...languages, {code: 'viVN', name: '베트남어'}])
                                }}>베트남어</MDBDropdownItem>
                                <MDBDropdownItem link onClick={() => {
                                    setLanguages([...languages, {code: 'other', name: '기타'}])
                                }}>기타</MDBDropdownItem>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                        <ReactSortable animation={200} easing={"ease-out"} list={languages} setList={setLanguages}>
                            {languages.map((item) => (
                                <div style={{
                                    borderBottom: 'solid', borderWidth: 'thin', margin: '10px', paddingLeft: '3px',
                                    fontSize: '15px'
                                }} key={item.code}>{item.name}</div>
                            ))}
                        </ReactSortable>
                        <MDBDropdown style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <MDBDropdownToggle size={'sm'} color={'link'}>Remove Languages</MDBDropdownToggle>
                            <MDBDropdownMenu>
                                {languages.map((item, index) => {
                                    return <MDBDropdownItem link onClick={() => {
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
                            setLanguages(props.languages.map((value) => {
                                return {code: value.code, name: value.name}
                            }))
                        }}>Close</MDBBtn>
                        <MDBBtn onClick={() => {
                            toggleShow()
                            props.setLanguages(languages)
                        }}>Save changes</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default LanguagesModal