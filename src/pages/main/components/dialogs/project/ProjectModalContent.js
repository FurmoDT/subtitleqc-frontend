import {MDBBtn, MDBCol, MDBModalBody, MDBModalContent, MDBModalHeader, MDBRow,} from 'mdb-react-ui-kit';

const ProjectModalContent = ({toggleShow}) => {

    return <MDBModalContent style={{backgroundColor: '#f28720ff'}}>
        <MDBModalHeader style={{borderBottom: 'none'}}>
            <MDBBtn className='btn-close' color='none' onClick={toggleShow}/>
        </MDBModalHeader>
        <MDBModalBody>
            <MDBRow className={'mb-1'} style={{backgroundColor: '#f3f3f3ff', margin: 'inherit', padding: '1rem 0'}}>
                <MDBCol>
                    <label className={'fw-bold'}>프로젝트 등록</label>
                </MDBCol>
                <MDBCol>
                    <label className={'fw-bold'}>견적서 등록</label>
                </MDBCol>
            </MDBRow>
        </MDBModalBody>
    </MDBModalContent>
}

export default ProjectModalContent
