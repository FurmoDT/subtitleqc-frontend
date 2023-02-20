import {useState} from 'react';
import {
    MDBBtn,
    MDBIcon,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';
import {defaultLanguage, defaultSubtitle} from "../../../utils/config";

const CheckModal = (props) => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
            toggleShow()
        }}><MDBIcon far icon="file" size={'2x'}/></MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'sm'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>&#x26A0;&#xFE0F;</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>Clear All</MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={() => {
                            toggleShow()
                            props.setLanguages(defaultLanguage)
                            props.cellDataRef.current = defaultSubtitle()
                            props.setFxLanguages(defaultLanguage)
                            props.fxRef.current = defaultSubtitle()
                            props.hotRef.current.clear()
                            localStorage.removeItem('language')
                            localStorage.removeItem('subtitle')
                            localStorage.removeItem('fxLanguage')
                            localStorage.removeItem('fx')
                        }}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default CheckModal