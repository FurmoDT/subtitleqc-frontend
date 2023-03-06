import {useCallback, useEffect, useState} from 'react';
import {
    MDBBtn,
    MDBCol,
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
    MDBRow,
} from 'mdb-react-ui-kit';
import {FiSun, FiSunrise, FiSunset} from "react-icons/fi";
import {TbArrowsJoin2, TbArrowsSplit2} from "react-icons/tb";

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
                            <MDBRow>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <div>
                                            <MDBIcon fas icon="play" color={'dark'}/> / <MDBIcon fas icon="pause"
                                                                                                 color={'dark'}/>
                                        </div>
                                        SPACE , F6
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow style={{paddingBottom: 10}}>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="angle-double-left"/> ←
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="angle-double-right"/> →
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="angle-double-up"/> SHIFT >
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="angle-double-down"/> {'SHIFT <'}
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                        </MDBListGroup>
                        <h6 className='bg-light p-2 border-top border-bottom'>Subtitle</h6>
                        <MDBListGroup light small>
                            <MDBRow style={{paddingBottom: 10}}>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="undo"/> CTRL Z
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="redo"/> CTRL SHIFT Z
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow style={{paddingBottom: 10}}>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <FiSun color={'black'} size={20}/> F9
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <FiSunrise color={'black'} size={20}/> F10
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <FiSunset color={'black'} size={20}/> F11
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
                            <MDBRow style={{paddingBottom: 10}}>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <TbArrowsSplit2 color={'black'} size={20}/> CTRL SHIFT D
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <TbArrowsJoin2 color={'black'} size={20}/> SHIFT F12
                                    </MDBListGroupItem>
                                </MDBCol>
                                <MDBCol size={3}>
                                    <MDBListGroupItem className='d-flex justify-content-between align-items-center'
                                                      style={{paddingLeft: 10, paddingRight: 10}}>
                                        <MDBIcon fas icon="search" color={'dark'}/> CTRL F
                                    </MDBListGroupItem>
                                </MDBCol>
                            </MDBRow>
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
