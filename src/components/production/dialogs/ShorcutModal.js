import {useCallback, useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBIcon,
    MDBListGroup,
    MDBListGroupItem,
    MDBModal,
    MDBModalBody,
    MDBModalContent,
    MDBModalDialog,
    MDBModalFooter,
    MDBModalHeader,
    MDBModalTitle,
} from 'mdb-react-ui-kit';

const ShortcutModal = (props) => {
    const [basicModal, setBasicModal] = useState(false);
    const toggleShow = () => setBasicModal(!basicModal);
    const handleKeyDown = useCallback((event) => {
        if ((event.code === 'Space' && event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'VIDEO' && event.target.tagName !== 'INPUT') || event.key === 'F6') {
            event.preventDefault();
            if (props.playerRef.current.getInternalPlayer()?.paused) props.playerRef.current.getInternalPlayer().play()
            else props.playerRef.current.getInternalPlayer()?.pause()
        }
        if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            props.findButtonRef.current.click()
        }
        if (event.key === 'F9') {
            event.preventDefault();
            props.tcIoButtonRef.current.click()
        }
        if (event.key === 'F10') {
            event.preventDefault();
            props.tcInButtonRef.current.click()
        }
        if (event.key === 'F11') {
            event.preventDefault();
            props.tcOutButtonRef.current.click()
        }
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            props.splitLineButtonRef.current.click()
        }
        if (event.shiftKey && event.key === 'F12') {
            event.preventDefault();
            props.mergeLineButtonRef.current.click()
        }
        if (event.shiftKey && event.key === '<') {
            const internalPlayer = props.playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = Math.max(internalPlayer.playbackRate - 0.25, 0.25)
        }
        if (event.shiftKey && event.key === '>') {
            const internalPlayer = props.playerRef.current.getInternalPlayer()
            if (internalPlayer) internalPlayer.playbackRate = Math.min(internalPlayer.playbackRate + 0.25, 2)
        }
    }, [props.playerRef, props.findButtonRef, props.splitLineButtonRef, props.mergeLineButtonRef, props.tcIoButtonRef, props.tcInButtonRef, props.tcOutButtonRef])
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);
    return <>
        <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
            toggleShow()
        }}><MDBIcon fas icon="keyboard" size={'2x'}/></MDBBtn>
        <MDBModal show={basicModal} setShow={setBasicModal} tabIndex='-1'>
            <MDBModalDialog size={'lg'}>
                <MDBModalContent>
                    <MDBModalHeader>
                        <MDBModalTitle>Shortcut</MDBModalTitle>
                        <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
                    </MDBModalHeader>
                    <MDBModalBody>
                        <h6 className='bg-light p-2 border-top border-bottom'>VIDEO</h6>
                        <MDBListGroup light small>
                            <MDBListGroupItem>
                                이동
                            </MDBListGroupItem>
                            <MDBListGroupItem>
                                배속
                            </MDBListGroupItem>
                        </MDBListGroup>
                        <h6 className='bg-light p-2 border-top border-bottom'>Subtitle</h6>
                        <MDBListGroup light small>
                            <MDBListGroupItem>
                                실행 취소
                            </MDBListGroupItem>
                            <MDBListGroupItem>
                                다시 실행
                            </MDBListGroupItem>
                        </MDBListGroup>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn color='secondary' onClick={toggleShow}>NO</MDBBtn>
                        <MDBBtn onClick={toggleShow}>YES</MDBBtn>
                    </MDBModalFooter>
                </MDBModalContent>
            </MDBModalDialog>
        </MDBModal>
    </>
}

export default ShortcutModal
