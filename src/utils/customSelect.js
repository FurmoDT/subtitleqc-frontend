import {components} from "react-select";

export const CustomOption = (props) => {
    return <>
        <components.Option {...props}>
            <p className='fw-bold mb-1'>{props.children}</p>
            <p className='mb-0'>{props.data.email}</p>
        </components.Option>
    </>;
};

export const CustomPdControl = (props) => {
    return <>
        <components.Control {...props}>
            <label className={'text-muted'} style={{marginLeft: '0.5rem'}}>*PD</label>
            {props.children}
        </components.Control>
    </>;
};

export const CustomPmControl = (props) => {
    return <>
        <components.Control {...props}>
            <label className={'text-muted'} style={{marginLeft: '0.5rem'}}>*PM 이름</label>
            {props.children}
        </components.Control>
    </>;
};

export const customStyle = {
    container: base => ({...base, minWidth: '5rem', textAlign: 'left', whiteSpace: 'nowrap'}),
    clearIndicator: base => ({...base, padding: '0 0.5rem'}),
    dropdownIndicator: base => ({...base, padding: 0}),
    menu: base => ({...base, width: 'auto'}),
    valueContainer: base => ({...base, padding: '0 0.5rem', fontSize: '0.8rem'}),
    control: base => ({...base, minHeight: '36px'}),
}

export const customMultiStyle = {
    container: base => ({...base, minWidth: '5rem', textAlign: 'left', whiteSpace: 'nowrap'}),
    dropdownIndicator: base => ({...base, padding: 0}),
    menu: base => ({...base, width: 'auto'}),
    valueContainer: base => ({...base, padding: '0 0.5rem', fontSize: '1rem'}),
    control: base => ({...base, minHeight: '36px'}),
}


export const customTaskLanguageStyle = {
    container: base => ({...base, minWidth: '5rem', textAlign: 'left', whiteSpace: 'nowrap', fontSize: '0.8rem'}),
    dropdownIndicator: base => ({...base, padding: 0}),
    menu: base => ({...base, width: 'auto'}),
    valueContainer: base => ({...base, padding: '0 0.5rem'}),
    control: base => ({...base, minHeight: '1.75rem', maxHeight: '1.75rem'}),
    input: base => ({...base, margin: '0 2px'}),
}
