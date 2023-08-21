import {useEffect, useRef} from "react";
import WebViewer from '@pdftron/webviewer';

const DocViewer = ({textFile}) => {
    const viewer = useRef(null);

    useEffect(() => {
        WebViewer({
            path: '/webviewer',
            licenseKey: 'demo:1691321479102:7c5cde3a030000000098e5ae4b3bfe9f2e04b89f2529305bd83b50c6d7',
            initialDoc: textFile,
            disabledElements: ['menuButton', 'leftPanelButton', 'panToolButton', 'toggleNotesButton', 'selectToolButton', 'toolsHeader', 'ribbons'],
        }, viewer.current,).then((instance) => {
            const {documentViewer} = instance.Core;
            // you can now call WebViewer APIs here...
        });
    }, [textFile]);

    return <>
        <div className="MyComponent" style={{width: '100%', height: '100%'}}>
            <div className="webviewer" ref={viewer} style={{height: "100%"}}/>
        </div>
    </>
};

export default DocViewer
