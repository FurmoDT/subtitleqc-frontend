import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {ko} from 'date-fns/esm/locale';

const DatePickerComponent = ({startAt, setStartAt, endAt, setEndAt}) => {
    const ExampleCustomInput = ({value, onClick}) => (
        <label style={{fontSize: '0.8rem'}} onClick={onClick}>{value}</label>
    );
    return <div style={{width: '200px', textAlign: 'center', marginBottom: 10}}>
        <div style={{backgroundColor: '#f28720ff', color: 'black', fontSize: '0.875rem'}}>
            <label>조회 기간</label>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', backgroundColor: 'white'}}>
            <DatePicker customInput={<ExampleCustomInput/>} selected={startAt} locale={ko}
                        dateFormat={'yyyy-MM-dd'} onChange={(date) => setStartAt(date)}/>
            -
            <DatePicker customInput={<ExampleCustomInput/>} selected={endAt} locale={ko} maxDate={new Date()}
                        dateFormat={'yyyy-MM-dd'} onChange={(date) => setEndAt(date)}/>
        </div>
    </div>
};

export default DatePickerComponent