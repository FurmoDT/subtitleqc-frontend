import {components} from "react-select";

export const CustomOption = (props) => {
    return <>
        <components.Option {...props}>
            <p className='fw-bold mb-1'>{props.children}</p>
            <p className='mb-0'>{props.data.email}</p>
        </components.Option>
    </>;
};
export const customStyle = {
    container: base => ({...base, marginRight: '0.5rem', minWidth: '5rem', textAlign: 'left', whiteSpace: 'nowrap'}),
    dropdownIndicator: base => ({...base, padding: 0}),
    menu: base => ({...base, width: 'auto'})
}
