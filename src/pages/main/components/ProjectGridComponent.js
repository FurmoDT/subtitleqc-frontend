import DataGrid from "react-data-grid";

const ProjectGridComponent = ({startAt, endAt}) => {
    return <DataGrid className={'rdg-light fill-grid'} style={{height: '100%'}} columns={[]} rows={[]}
                     rowHeight={45} defaultColumnOptions={{resizable: true}}/>
}

export default ProjectGridComponent
