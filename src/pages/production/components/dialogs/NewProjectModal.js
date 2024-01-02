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
import {defaultLanguage, defaultProjectDetail, defaultSubtitle} from "../../../../utils/config";

const NewProjectModal = (props) => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    return <>
        <MDBBtn className={'mx-1 color-black'} size={'sm'} color={'link'} onClick={toggleShow}>
            <MDBIcon far icon="file" size={'2x'}/></MDBBtn>
        <MDBModal show={basicModal} tabIndex='-1'>
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
                                props.setProjectDetail(defaultProjectDetail()),
                                props.cellDataRef.current = defaultSubtitle(),
                                props.setLanguages(defaultLanguage()),
                                props.setLanguageFile(null),
                                props.setMediaFile(null),
                                props.setMediaInfo(null),
                                props.setTcLock(false),
                                document.getElementById('tcLock-checkbox').checked = false,
                                props.waveformRef.current?.segments.removeAll(),
                            ]).then(() => {
                                localStorage.removeItem('projectDetail')
                                localStorage.removeItem('language')
                                localStorage.removeItem('subtitle')
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
