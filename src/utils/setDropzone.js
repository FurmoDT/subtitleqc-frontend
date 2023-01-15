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

export const setDropzone = (element) => {
    let counter = 0
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        counter++
    }
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Object.assign(element.style, dragStyle);
    };
    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation();
        counter--
        if (!counter) Object.assign(element.style, baseStyle);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        counter = 0
        Object.assign(element.style, baseStyle);
        const files = e.dataTransfer.files;
        console.log(files);
    };
    Object.assign(element.style, baseStyle);
    element.addEventListener('dragenter', handleDragEnter)
    element.addEventListener('dragover', handleDragOver)
    element.addEventListener('dragleave', handleDragLeave)
    element.addEventListener('drop', handleDrop)
}