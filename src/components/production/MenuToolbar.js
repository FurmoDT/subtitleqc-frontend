import {MDBBtn} from "mdb-react-ui-kit";

const MenuToolbar = () => {
    return <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 'thin',
        backgroundColor: 'lightgray'
    }}>
        <MDBBtn style={{marginLeft: '5px'}} outline size={'sm'} disabled>Download</MDBBtn>
        <MDBBtn style={{marginLeft: '5px'}} outline size={'sm'} disabled>Shortcuts</MDBBtn>
        <label style={{position: 'absolute', left: '50%'}}>MenuToolbar</label>
    </div>
};

export default MenuToolbar
