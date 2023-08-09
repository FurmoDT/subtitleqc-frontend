import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import SplitterLayout from "react-splitter-layout-react-v18";
import DocViewer from "./components/DocViewer";
import {useEffect, useState} from "react";
import axios from "../../utils/axios";
import {fileExtension} from "../../utils/functions";
import PdfViewer from "./components/PdfViewer";
import {useNavigate} from "react-router-dom";

const TextPage = () => {
    const pathname = window.location.pathname
    const navigate = useNavigate()
    const [textFile, setTextFile] = useState(null)
    const [authority, setAuthority] = useState(null)

    useEffect(() => {
        if (!pathname.split('/')[2]) {
            setAuthority('test')
            setTextFile('https://subtitleqc.s3.ap-northeast-2.amazonaws.com/sample.pdf')
            return
        }
        axios.get(`v1/project/task/work`, {
            params: {
                hashed_id: pathname.split('/')[2],
                work_type: pathname.split('/')[3]
            }
        }).then((respond) => {
            setAuthority(respond.data.authority)
            const task = respond.data.task
            setTextFile(`https://s3.subtitleqc.ai/task/${task.task_id}/source/original_v${task.task_file_version}.${fileExtension(task.task_file_name)}`)
        }).catch(() => navigate('/error'))
    }, [pathname, navigate])

    return <div style={{width: '100vw', height: 'calc(100vh - 50px)'}}>
        <MenuToolbar/>
        <div style={{width: '100%', height: 'calc(100% - 40px)', position: 'relative'}}>
            <SplitterLayout vertical={true} percentage={true} secondaryInitialSize={25}>
                {textFile && <SplitterLayout percentage={true} secondaryInitialSize={60}>
                    {fileExtension(textFile).startsWith('doc') ? <DocViewer textFile={textFile}/> :
                        fileExtension(textFile) === 'pdf' ? <PdfViewer textFile={textFile}/> : null
                    }
                    <SplitterLayout percentage={true} secondaryInitialSize={50}>
                        <QuillEditor editorType={'original'}/>
                        {['test', 'pm', 'pd', 'qc'].includes(authority) && <QuillEditor editorType={'review'}/>}
                    </SplitterLayout>
                </SplitterLayout>}
                <div/>
            </SplitterLayout>
        </div>
    </div>
};

export default TextPage
