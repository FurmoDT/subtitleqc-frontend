import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import SplitterLayout from "react-splitter-layout-react-v18";
import DocViewer from "./components/DocViewer";
import {useEffect, useState} from "react";
import axios from "../../utils/axios";
import {fileExtension} from "../../utils/functions";
import PdfViewer from "./components/PdfViewer";

const TextPage = () => {
    const pathname = window.location.pathname
    const [textFile, setTextFile] = useState(null)

    useEffect(() => {
        if (!pathname.split('/')[2]) {
            setTextFile('https://subtitleqc.s3.ap-northeast-2.amazonaws.com/sample.pdf')
            return
        }
        axios.get(`v1/project/task`, {params: {hashed_id: pathname.split('/')[2]}}).then((respond) => {
            setTextFile(`https://s3.subtitleqc.ai/task/${respond.data.task_id}/source/original_v${respond.data.task_file_version}.${fileExtension(respond.data.task_file_name)}`)
        })
    }, [pathname])

    useEffect(() => {
        console.log(textFile)
    }, [textFile])

    return <div style={{width: '100vw', height: 'calc(100vh - 50px)'}}>
        <MenuToolbar/>
        <div style={{width: '100%', height: 'calc(100% - 40px)', position: 'relative'}}>
            <SplitterLayout vertical={true} percentage={true} secondaryInitialSize={25}>
                <SplitterLayout percentage={true} secondaryInitialSize={60}>
                    {textFile && fileExtension(textFile).startsWith('doc') ? <DocViewer textFile={textFile}/> :
                        fileExtension(textFile) === 'pdf' ? <PdfViewer textFile={textFile}/> : null
                    }
                    <SplitterLayout percentage={true} secondaryInitialSize={50}>
                        <QuillEditor/>
                        <QuillEditor/>
                    </SplitterLayout>
                </SplitterLayout>
                <div/>
            </SplitterLayout>
        </div>
    </div>
};

export default TextPage
