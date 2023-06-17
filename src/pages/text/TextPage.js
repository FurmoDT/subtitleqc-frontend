import MenuToolbar from "./components/MenuToolbar";
import QuillEditor from "./components/QuillEditor";
import SplitterLayout from "react-splitter-layout-react-v18";
import PdfViewer from "./components/PdfViewer";

const TextPage = () => {

    return <div style={{width: '100vw', height: 'calc(100vh - 50px)'}}>
        <MenuToolbar/>
        <div style={{width: '100%', height: 'calc(100% - 40px)', position: 'relative'}}>
            <SplitterLayout vertical={true} percentage={true} secondaryInitialSize={25}>
                <SplitterLayout percentage={true} secondaryInitialSize={60}>
                    <PdfViewer/>
                    <SplitterLayout percentage={true} secondaryInitialSize={50}>
                        <QuillEditor/>
                        <QuillEditor/>
                    </SplitterLayout>
                </SplitterLayout>
                <div>component</div>
            </SplitterLayout>
        </div>
    </div>
};

export default TextPage
