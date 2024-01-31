import {useCallback, useEffect} from 'react';
import {parseFsp, parseSrt, parseVtt} from "../../../utils/fileParser";
import {xml2json} from "xml-js";
import {getFileInfo} from "../../../utils/functions";
import chardet from "chardet"

const baseStyle = {
    borderStyle: 'none',
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
        for (const item of e.dataTransfer.items) {
            if (item.kind !== 'file') return
        }
        counter = Math.max(counter++, 2)
        Object.assign(props.dropzoneRef.current.style, dragStyle);
    }, [props.dropzoneRef])
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, [])
    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation();
        counter--
        if (!counter) Object.assign(props.dropzoneRef.current.style, baseStyle);
    }, [props.dropzoneRef])
    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        counter = 0
        Object.assign(props.dropzoneRef.current.style, baseStyle);
        const files = e.dataTransfer.files;
        for (const file of Array.from(files)) {
            const fileFormat = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
            if (!props.taskHashedId && ['.mp4', '.mov'].includes(fileFormat)) {
                props.setMediaInfo(JSON.parse(await getFileInfo(file)))
                props.setMediaFile(URL.createObjectURL(file))
            } else if (['.fsp', '.srt', '.vtt', '.fspx'].includes(fileFormat)) {
                const reader = new FileReader()
                reader.onload = () => {
                    let binaryStr = new ArrayBuffer(0)
                    binaryStr = reader.result
                    const byteArray = new Uint8Array(binaryStr);
                    const encoding = chardet.detect(byteArray);
                    const decoder = new TextDecoder(encoding || 'UTF-8');
                    const str = decoder.decode(binaryStr)
                    if (file.name.endsWith('.fsp')) {
                        props.setLanguageFile({...parseFsp(JSON.parse(xml2json(str, {compact: false})), props.languages)})
                    } else if (file.name.endsWith('.srt')) {
                        props.setLanguageFile({...parseSrt(str)})
                    } else if (file.name.endsWith('.vtt')) {
                        props.setLanguageFile({...parseVtt(str)})
                    } else if (file.name.endsWith('.fspx')) {
                        props.setLanguageFile(JSON.parse(str))
                    }
                }
                reader.readAsArrayBuffer(file)
            }
        }
    }, [props])

    useEffect(() => {
        Object.assign(props.dropzoneRef.current.style, baseStyle)
    }, [props.dropzoneRef])

    useEffect(() => {
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
