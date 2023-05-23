import {useCallback, useEffect} from 'react';
import languageEncoding from "detect-file-encoding-and-language";
import {parseFsp, parseSrt} from "../../../utils/fileParser";
import {xml2json} from "xml-js";
import {getInfo} from 'react-mediainfo'

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

let counter = 0
const Dropzone = (props) => {
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        counter++
    }, [])
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        Object.assign(props.dropzoneRef.current.style, dragStyle);
    }, [props.dropzoneRef])
    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation();
        counter--
        if (!counter) Object.assign(props.dropzoneRef.current.style, baseStyle);
    }, [props.dropzoneRef])
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        counter = 0
        Object.assign(props.dropzoneRef.current.style, baseStyle);
        const files = e.dataTransfer.files;
        Array.from(files).forEach((file) => {
            const fileFormat = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            if (['.mp4', '.mov'].includes(fileFormat)) {
                getInfo(file).then(info => props.setMediaInfo(info))
                props.setMediaFile(URL.createObjectURL(file))
            } else if (['.fsp', '.srt', '.fspx'].includes(fileFormat)) {
                const reader = new FileReader()
                reader.onload = () => {
                    let binaryStr = new ArrayBuffer(0)
                    binaryStr = reader.result
                    languageEncoding(file, {fallbackEncoding: null}).then((fileInfo) => {
                        const decoder = new TextDecoder(fileInfo.encoding || 'UTF-8');
                        const str = decoder.decode(binaryStr)
                        const languages = !props.fnToggleRef.current ? props.languages : props.fnLanguages
                        if (file.name.endsWith('.fsp')) {
                            props.setLanguageFile({prevLanguages: languages, ...parseFsp(JSON.parse(xml2json(str, {compact: false})), languages)})
                        } else if (file.name.endsWith('.srt')) {
                            props.setLanguageFile({prevLanguages: languages, ...parseSrt(str)})
                        } else if (file.name.endsWith('.fspx')) {
                            props.setLanguageFile(JSON.parse(str))
                        }
                    })
                }
                reader.readAsArrayBuffer(file)
            }
        })
    }, [props])
    useEffect(() => {
        Object.assign(props.dropzoneRef.current.style, baseStyle);
        props.dropzoneRef.current.addEventListener('dragenter', handleDragEnter)
        props.dropzoneRef.current.addEventListener('dragover', handleDragOver)
        props.dropzoneRef.current.addEventListener('dragleave', handleDragLeave)
        props.dropzoneRef.current.addEventListener('drop', handleDrop)
        return () => {
            props.dropzoneRef.current?.removeEventListener('dragenter', handleDragEnter)
            props.dropzoneRef.current?.removeEventListener('dragover', handleDragOver)
            props.dropzoneRef.current?.removeEventListener('dragleave', handleDragLeave)
            props.dropzoneRef.current?.removeEventListener('drop', handleDrop)
        }
    }, [props.dropzoneRef, handleDragEnter, handleDragOver, handleDragLeave, handleDrop]);
    return null
}

export default Dropzone;
