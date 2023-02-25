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

const NewProjectModal = (props) => {
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
                            Promise.all([
                                props.setLanguages(defaultLanguage()),
                                props.setFxLanguages(defaultLanguage()),
                                props.cellDataRef.current = defaultSubtitle(),
                                props.fxRef.current = defaultSubtitle(),
                                () => {
                                    localStorage.removeItem('language')
                                    localStorage.removeItem('subtitle')
                                    localStorage.removeItem('fxLanguage')
                                    localStorage.removeItem('fx')
                                },
                                props.setLanguageFile(null),
                                props.waveformRef.current?.segments.removeAll(),
                                props.hotRef.current.clear()
                            ]).then(() => {
                                toggleShow()
                            })
                        }}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default NewProjectModal
