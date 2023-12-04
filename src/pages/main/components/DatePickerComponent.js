import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {forwardRef} from "react";
import {MDBCol, MDBRow} from "mdb-react-ui-kit";

const DatePickerComponent = ({startAt, setStartAt, endAt, setEndAt}) => {
    const ExampleCustomInput = forwardRef(({value, onClick}, ref) => (
        <span className={'text-nowrap'} style={{fontSize: '0.8rem'}} onClick={onClick}>{value}</span>));
    return <MDBRow className={'p-0 m-0 rounded border-main'} style={{width: '12.5rem', color: 'black'}}>
        <MDBRow className={'bg-main rounded-top m-0'} style={{fontSize: '0.875rem'}}>
            <span>조회 기간</span>
        </MDBRow>
        <MDBRow className={'m-0'}>
            <MDBCol className={'p-0'}>
                <DatePicker customInput={<ExampleCustomInput/>} selected={startAt} maxDate={endAt}
                            dateFormat={'yyyy-MM-dd'} onChange={(date) => setStartAt(date.setHours(0, 0, 0, 0))}/>
            </MDBCol>
            <MDBCol className={'p-0'}>
                -
            </MDBCol>
            <MDBCol className={'p-0'}>
                <DatePicker customInput={<ExampleCustomInput/>} selected={endAt} minDate={startAt}
                            dateFormat={'yyyy-MM-dd'} onChange={(date) => setEndAt(date.setHours(23, 59, 59, 999))}/>
            </MDBCol>
        </MDBRow>
    </MDBRow>
};

export default DatePickerComponent
