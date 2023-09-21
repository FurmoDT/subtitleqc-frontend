import {forwardRef} from "react";
import {MDBInput} from "mdb-react-ui-kit";

export const inputStyle = {backgroundColor: 'white', color: 'black'}
export const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem'}

export const CustomInput = forwardRef(({value, onClick, label}, ref) => {
    return <MDBInput style={inputStyle} label={label} labelStyle={labelStyle} onClick={onClick} value={value}/>
})
