import {components} from "react-select";

export const CustomOption = (props) => {
    return <>
        <components.Option {...props}>
            <p className='fw-bold mb-1'>{props.children}</p>
            <p className='mb-0'>{props.data.email}</p>
        </components.Option>
    </>;
};

export const CustomControl = (props) => {
    return <>
        <components.Control {...props}>
            <label className={'text-muted'} style={{marginLeft: '0.5rem'}}>PD</label>
            {props.children}
        </components.Control>
    </>;
};

export const customStyle = {
    container: base => ({...base, minWidth: '5rem', textAlign: 'left', whiteSpace: 'nowrap'}),
    dropdownIndicator: base => ({...base, padding: 0}),
    menu: base => ({...base, width: 'auto'}),
    valueContainer: base => ({...base, padding: '0 0.5rem'}),
    control: base => ({...base, minHeight: '36px'}),
}
