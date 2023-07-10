import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {ko} from 'date-fns/esm/locale';
import {forwardRef} from "react";
import {MDBCol, MDBRow} from "mdb-react-ui-kit";

const DatePickerComponent = ({startAt, setStartAt, endAt, setEndAt}) => {
    const ExampleCustomInput = forwardRef(({value, onClick}, ref) => (
        <label style={{fontSize: '0.8rem', whiteSpace: 'nowrap'}} onClick={onClick}>{value}</label>));
    return <MDBRow style={{width: '200px'}}>
        <MDBRow style={{backgroundColor: '#f28720ff', color: 'black', fontSize: '0.875rem'}}>
            <label>조회 기간</label>
        </MDBRow>
        <MDBRow style={{backgroundColor: 'white'}}>
            <MDBCol style={{padding: 0}}>
                <DatePicker customInput={<ExampleCustomInput/>} selected={startAt} locale={ko} maxDate={endAt}
                            dateFormat={'yyyy-MM-dd'} onChange={(date) => setStartAt(date)}/>
            </MDBCol>
            <MDBCol style={{padding: 0}}>
                -
            </MDBCol>
            <MDBCol style={{padding: 0}}>
                <DatePicker customInput={<ExampleCustomInput/>} selected={endAt} locale={ko} minDate={startAt}
                            maxDate={new Date()} dateFormat={'yyyy-MM-dd'} onChange={(date) => setEndAt(date)}/>
            </MDBCol>
        </MDBRow>
    </MDBRow>
};

export default DatePickerComponent
