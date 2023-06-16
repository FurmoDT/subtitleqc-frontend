import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import SplitterLayout from "react-splitter-layout-react-v18";
import PdfViewer from "./components/PdfViewer";

const TextPage = () => {

    return <div style={{width: '100%', height: 'calc(100vh - 50px)'}}>
        <MenuToolbar/>
        <SplitterLayout>
            <PdfViewer/>
            <SplitterLayout>
                <QuillEditor/>
                <QuillEditor/>
            </SplitterLayout>
        </SplitterLayout>
    </div>
};

export default TextPage
