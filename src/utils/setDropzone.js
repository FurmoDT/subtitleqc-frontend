const baseStyle = {
    backgroundColor: '#fafafa',
    borderWidth: 2,
    borderRadius: 2,
    borderStyle: 'dashed',
    borderColor: '#ffffff',
    transition: 'border .24s ease-in-out'
};

const dragStyle = {
    borderStyle: 'dashed',
    borderColor: '#2196f3',
};

export const setDropzone = (props) => {
    let counter = 0
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        counter++
    }
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Object.assign(props.element.style, dragStyle);
    };
    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation();
        counter--
        if (!counter) Object.assign(props.element.style, baseStyle);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        counter = 0
        Object.assign(props.element.style, baseStyle);
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
            const fileFormat = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            if (['.mp4'].includes(fileFormat)) {
                props.setMediaFile(URL.createObjectURL(file))
            } else if (['.fsp', '.srt'].includes(fileFormat)) {
                props.setLanguageFile(file)
            }
        })
    };
    Object.assign(props.element.style, baseStyle);
    props.element.addEventListener('dragenter', handleDragEnter)
    props.element.addEventListener('dragover', handleDragOver)
    props.element.addEventListener('dragleave', handleDragLeave)
    props.element.addEventListener('drop', handleDrop)
}
