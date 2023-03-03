import {MDBBtn, MDBIcon, MDBInput, MDBPopover, MDBPopoverBody, MDBPopoverHeader,} from 'mdb-react-ui-kit';
import {useEffect} from "react";

const FindPopover = (props) => {
    useEffect(() => {
        props.findButtonRef.current = document.getElementById('find-popover')
    }, [props.findButtonRef])
    return <>
        <MDBPopover id={'find-popover'} size={'sm'} color={'link'}
                    btnChildren={<MDBIcon fas icon="search" color={'dark'}/>}>
            <MDBPopoverHeader>Find</MDBPopoverHeader>
            <MDBPopoverBody style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <MDBInput type='text'/>
                <div style={{margin: '5px 5px 5px 5px'}}/>
                <MDBBtn size={'sm'} color={'link'} floating tag='a'>
                    <MDBIcon fas icon="chevron-left" color={'dark'}/>
                </MDBBtn>
                <MDBBtn size={'sm'} color={'link'} floating tag='a'>
                    <MDBIcon fas icon="chevron-right" color={'dark'}/>
                </MDBBtn>
            </MDBPopoverBody>
        </MDBPopover>
    </>
}

export default FindPopover
