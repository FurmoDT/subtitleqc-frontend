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

const LanguagesModal = (props) => {
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
                        <MDBDropdown>
                            <MDBDropdownToggle>Add Languages</MDBDropdownToggle>
                            <MDBDropdownMenu>
                                <MDBDropdownItem link>한국어</MDBDropdownItem>
                                <MDBDropdownItem link>영어</MDBDropdownItem>
                                <MDBDropdownItem link>중국어</MDBDropdownItem>
                                <MDBDropdownItem link>베트남어</MDBDropdownItem>
                                <MDBDropdownItem link>기타</MDBDropdownItem>
                            </MDBDropdownMenu>
                        </MDBDropdown>
                        <MDBDropdown>
                            <MDBDropdownToggle>Remove Languages</MDBDropdownToggle>
                        </MDBDropdown>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>Close</MDBBtn>
                        <MDBBtn onClick={toggleShow}>Save changes</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default LanguagesModal