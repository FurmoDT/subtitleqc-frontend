import * as Y from 'yjs'
import ReactQuill from "react-quill";
import {QuillBinding} from 'y-quill'
import {IndexeddbPersistence} from 'y-indexeddb'
import {WebrtcProvider} from 'y-webrtc'
import {useContext, useEffect, useMemo, useRef, useState} from "react";
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import '../../../css/Quill.css'
import QuillCursors from 'quill-cursors'
import {AuthContext} from "../../../contexts/authContext";
import {WebsocketContext} from "../../../contexts/websocketContext";
import {fromUint8Array, toUint8Array} from "js-base64";
import {localWsUrl, wsUrl} from "../../../utils/config";
import axios from "../../../utils/axios";
import Delta from "quill-delta";
import * as Grammarly from "@grammarly/editor-sdk";
import {SessionContext} from "../../../contexts/sessionContext";

const icons = ReactQuill.Quill.import("ui/icons");
ReactQuill.Quill.register('modules/cursors', QuillCursors)
const fontSizes = ['13px', '16px', '20px', '24px'];
const size = ReactQuill.Quill.import('attributors/style/size');
size.whitelist = fontSizes;
ReactQuill.Quill.register(size, true);

icons['undo'] = '<svg viewBox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" /><path class="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"/></svg>'
icons["redo"] = '<svg viewbox="0 0 18 18"><polygon class="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10"></polygon><path class="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"></path></svg>'
icons["viewer"] = '<label style="width: auto">VIEW&nbsp;MODE</label>'

function undoChange() {
    this.quill.history.undo();
}

function redoChange() {
    this.quill.history.redo();
}

const grammarly = async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn")

const QuillEditor = ({editorType, iceservers, isOnline, connectionType, disabled, onSave}) => {
    const {sessionId} = useContext(SessionContext)
    const [, , taskHashedId, taskWorkId] = window.location.pathname.split('/')
    const {userState} = useContext(AuthContext);
    const reactQuillRef = useRef(null)
    const [value, setValue] = useState('');
    const {wsRef, websocketConnected} = useContext(WebsocketContext)
    const initializedRef = useRef(false)
    const [forceRender, setForceRender] = useState(0)

    function preserveSizeFormat(node, delta) {
        const fontSize = node.style['font-size']
        if (fontSize) {
            delta.map(function (op) {
                if (!op.attributes) op.attributes = {}
                op.attributes.size = fontSize
                return op
            })
        } else {
            delta.map(function (op) {
                if (!op.attributes) op.attributes = {}
                op.attributes.size = '13px'
                return op
            })
        }
        return delta
    }

    const modules = useMemo(() => {
        if (disabled) {
            return {toolbar: {container: [['viewer']], handlers: {viewer: () => null}}, cursors: true}
        } else {
            return {
                toolbar: {
                    container: [[{'size': fontSizes}], [{'align': ['justify', 'center', 'right']}], [{'color': []}, {'background': []}], ['bold', 'italic', 'underline', 'strike'], ['clean'], ['undo', 'redo']],
                    handlers: {
                        undo: undoChange, redo: redoChange
                    }
                }, history: {
                    delay: 1000, userOnly: true
                }, cursors: true, clipboard: {
                    matchers: [[Node.ELEMENT_NODE, function (node, delta) {
                        return delta.compose(new Delta().retain(delta.length()));
                    }], ['p', preserveSizeFormat]]
                },
            }

        }
    }, [disabled])

    const formats = useMemo(() => {
        return ['size', 'color', 'background', 'bold', 'italic', 'underline', 'strike', 'align']
    }, [])

    useEffect(() => {
        const yDoc = new Y.Doc()
        const yText = yDoc.getText('quill')
        const provider = new WebrtcProvider(`${taskHashedId}-${editorType}`, yDoc, {
            signaling: [`${process.env.NODE_ENV === 'development' ? localWsUrl : wsUrl}/v1/webrtc`],
            maxConns: 20,
            peerOpts: {config: {iceServers: iceservers}}
        })
        const persistence = new IndexeddbPersistence(`crdt-${sessionId}-${taskHashedId}-${editorType}`, yDoc)
        provider.awareness.setLocalStateField('user', {name: `${userState.user.userEmail}`})
        if (disabled) provider.awareness.setLocalState(null)
        const binding = new QuillBinding(yText, reactQuillRef.current.getEditor(), provider.awareness)
        reactQuillRef.current.getEditor().format('size', '13px')

        persistence.once('synced', () => {
            if (taskHashedId) {
                axios.get('v1/project/task/content', {
                    params: {hashed_id: taskHashedId, room_type: editorType}
                }).then((r) => {
                    if (r.data) Y.applyUpdate(yDoc, toUint8Array(r.data.task_crdt))
                }).finally(() => initializedRef.current = true)
            }
        })

        yDoc.on('update', (update, origin, doc, tr) => {
            if (websocketConnected && origin && !origin.peerId && taskHashedId) {
                wsRef.current.send(JSON.stringify({
                    room_id: `${taskHashedId}-${editorType}`, update: fromUint8Array(update)
                }))
                if (origin.constructor === QuillBinding) onSave(false)
                else onSave(true)
            }
        })

        return () => {
            initializedRef.current = false
            provider.disconnect()
            provider.destroy()
            binding.destroy()
            yDoc.destroy()
        }
    }, [sessionId, taskHashedId, editorType, userState, wsRef, websocketConnected, iceservers, forceRender, disabled, onSave])

    useEffect(() => {
        if (initializedRef.current) setForceRender(prevState => prevState + 1)
    }, [isOnline, connectionType])

    useEffect(() => {
        if (!disabled && taskWorkId) {
            axios.get('v1/project/task/work', {
                params: {
                    hashed_id: taskHashedId,
                    work_hashed_id: taskWorkId
                }
            }).then((response) => {
                if (response.data.work_target_language === 'enUS') {
                    grammarly().then(r => {
                        r.addPlugin(reactQuillRef.current.getEditor().root, {
                            documentDialect: "american",
                        })
                    })
                }
            })
        }
    }, [disabled, taskHashedId, taskWorkId])

    return <ReactQuill ref={reactQuillRef} modules={modules} formats={formats} theme={'snow'} readOnly={disabled}
                       value={value} onChange={setValue}
                       style={{width: '100%', height: '100%', backgroundColor: disabled ? '#DDDDDD' : ''}}/>
};

export default QuillEditor
