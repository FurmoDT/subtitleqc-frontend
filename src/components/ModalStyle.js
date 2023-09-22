import {forwardRef} from "react";
import {MDBInput} from "mdb-react-ui-kit";

export const inputStyle = {backgroundColor: 'white'}
export const labelStyle = {fontSize: '0.8rem', lineHeight: '1.5rem'}

export const placeholderStyle = {
    fontSize: '0.8rem',
    lineHeight: '1.5rem',
    color: '#4f4f4f',
    marginLeft: '0.75rem',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
}

export const placeholderDisplayHandler = () => {

}

export const DateInput = forwardRef(({value, onClick, label}, ref) => {
    return <MDBInput style={inputStyle} label={label} labelStyle={labelStyle} onClick={onClick} value={value}/>
})
