import * as Y from 'yjs'
import ReactQuill from "react-quill";
import {QuillBinding} from 'y-quill'
import {IndexeddbPersistence} from 'y-indexeddb'
import {WebrtcProvider} from 'y-webrtc'
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import 'react-quill/dist/quill.snow.css';
import QuillCursors from 'quill-cursors'
import {AuthContext} from "../../../utils/authContext";
import {WebsocketContext} from "../../../utils/websocketContext";
import {fromUint8Array} from "js-base64";
import {localWsUrl, wsUrl} from "../../../utils/config";

const icons = ReactQuill.Quill.import("ui/icons");
ReactQuill.Quill.register('modules/cursors', QuillCursors)

icons['undo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" /><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"/></svg>'
icons["redo"] = '<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>'

function undoChange() {
    this.quill.history.undo();
}

function redoChange() {
    this.quill.history.redo();
}

const QuillEditor = ({editorType}) => {
    const pathname = window.location.pathname
    const [value, setValue] = useState('');
    const reactQuillRef = useRef(null)
    const {userState} = useContext(AuthContext);
    const {wsRef} = useContext(WebsocketContext)

    const modules = useMemo(() => {
        return {
            toolbar: {
                container: [[{size: ['normal', 'large']}], [{'color': []}, {'background': []}], ['bold', 'italic', 'underline', 'strike'], ['clean'], ['undo', 'redo']],
                handlers: {
                    undo: undoChange, redo: redoChange
                }
            }, history: {
                delay: 1000, userOnly: true
            }, cursors: true,
        }
    }, [])

    useEffect(() => {
        window.indexedDB.deleteDatabase(editorType)
    }, [editorType])

    useEffect(() => {
        const taskHashedId = pathname.split('/')[2]
        const ydoc = new Y.Doc()
        const ytext = ydoc.getText('quill')
        const provider = new WebrtcProvider(`${taskHashedId}-${editorType}`, ydoc, {
            signaling: [`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/webrtc`], maxConns: 20,
        })
        const persistence = new IndexeddbPersistence(editorType, ydoc)
        provider.awareness.setLocalStateField('user', {name: `${userState.user.userId}`})
        const binding = new QuillBinding(ytext, reactQuillRef.current.getEditor(), provider.awareness)

        persistence.once('synced', () => {
            if (provider.awareness.getStates().size) {
                // TODO sync with server DB
                // axios.get('v1/project/task/content', {params: {hashed_id: taskHashedId}}).then((r) => {
                //     r.data.forEach((item) => Y.applyUpdate(ydoc, toUint8Array(item)))
                // })
            }
        })

        ydoc.on('update', update => {
            wsRef.current.send(JSON.stringify({
                room_id: `${taskHashedId}-${editorType}`, update: fromUint8Array(update)
            }))
        })

        return () => {
            provider.disconnect()
            provider.destroy()
            binding.destroy()
            ydoc.destroy()
        }
    }, [pathname, editorType, userState, wsRef])

    return <ReactQuill ref={reactQuillRef} modules={modules} theme={'snow'} value={value} onChange={setValue}
                       style={{width: '100%', height: '100%'}}/>
};

export default QuillEditor
