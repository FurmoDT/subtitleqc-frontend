import {
    MDBBtn,
    MDBDropdown,
    MDBDropdownItem,
    MDBDropdownMenu,
    MDBDropdownToggle,
    MDBIcon,
    MDBTooltip
} from "mdb-react-ui-kit";
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
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='New File'>
            <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} onClick={() => {
                props.setLanguages([{code: 'xxXX', name: '기타 언어', counter: 1}])
                props.hotRef.current.clear()
                localStorage.clear()
            }}>
                <MDBIcon far icon="file" size={'lg'}/>
            </MDBBtn>
        </MDBTooltip>
        <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Shortcut'>
            <MDBBtn style={{marginLeft: '5px', color: 'black'}} size={'sm'} color={'link'} disabled>
                <MDBIcon fas icon="keyboard" size={'lg'}/>
            </MDBBtn>
        </MDBTooltip>
        <MDBDropdown>
            <MDBTooltip tag='span' wrapperClass='d-inline-block' title='Download'>
            <MDBDropdownToggle color={'link'}>
                <MDBIcon fas icon='download' size={'lg'} color={'dark'}/>
            </MDBDropdownToggle>
            </MDBTooltip>
            <MDBDropdownMenu>
                <MDBDropdownItem disabled link>.fspx</MDBDropdownItem>
                <MDBDropdownItem link onClick={() => {
                    props.languages.forEach((value) => {
                        const fileData = toSrt(props.cellDataRef.current, value)
                        const blob = new Blob([fileData], {type: "text/plain"})
                        const url = URL.createObjectURL(blob)
                        const link = document.createElement("a")
                        link.download = `${value.name}.srt`
                        link.href = url;
                        link.click();
                    })
                }}>.srt</MDBDropdownItem>
            </MDBDropdownMenu>
        </MDBDropdown>
        <label style={{position: 'absolute', left: '50%'}}>MenuToolbar</label>
    </div>
};

export default MenuToolbar
