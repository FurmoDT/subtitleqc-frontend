import {MDBBtn, MDBIcon, MDBTooltip} from "mdb-react-ui-kit";
import {toSrt} from "../../utils/fileParser";

const MenuToolbar = (props) => {
    return <div style={{
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        borderStyle: 'solid',
        borderWidth: 'thin',
        backgroundColor: 'lightgray'
    }}>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='다운로드'>
            <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'secondary'} onClick={() => {
                props.languages.forEach((value) => {
                    const fileData = toSrt(props.cellDataRef.current, value)
                    const blob = new Blob([fileData], {type: "text/plain"})
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement("a")
                    link.download = `${value.name}.srt`
                    link.href = url;
                    link.click();
                })
            }}>
                <MDBIcon fas icon='download' size={'lg'}/>
            </MDBBtn>
        </MDBTooltip>
        <MDBBtn style={{marginLeft: '5px'}} outline size={'sm'} disabled>Shortcuts</MDBBtn>
        <label style={{position: 'absolute', left: '50%'}}>MenuToolbar</label>
    </div>
};

export default MenuToolbar
