import Handsontable from 'handsontable';
import '../../../css/Handsontable.css'
import * as Grammarly from '@grammarly/editor-sdk'
import {useCallback, useEffect, useRef, useState} from "react";
import {durationValidator, tcInValidator, tcOutValidator, textValidator} from "../../../utils/hotRenderer";
import {createSegment, tcToSec} from "../../../utils/functions";
import {v4} from "uuid";
import {MDBBtn, MDBIcon} from "mdb-react-ui-kit";
import * as Y from "yjs";

const grammarly = (async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn"))()


const LanguageWindow = ({resetSegments, ...props}) => {
    const containerMain = useRef(null);
    const [totalLines, setTotalLines] = useState(0)
    const debounceTimeoutRef = useRef(null)
    const persistentRowIndexRef = useRef(0);
    const persistentUndoRedoRef = useRef({doneActions: [], undoneActions: []})
    const subtitleIndexRef = useRef(-1)
    const userCursorsRef = useRef({})
    const userRef = useRef(null)

    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const afterRenderCallback = () => resolve()
            props.hotRef.current?.addHookOnce('afterRender', afterRenderCallback)
        })
    }, [props.hotRef])

    const debounceRender = useCallback(() => {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = setTimeout(() => props.hotRef.current.render(), 200)
    }, [props.hotRef])

    const getTotalLines = useCallback(() => {
        const data = props.hotRef.current.getData()
        let totalLines = -1
        for (let i = data.length - 1; i >= 0; i--) {
            if (data[i].filter(v => v).length > 0) {
                totalLines = i
                break
            }
        }
        return Math.max(totalLines + 1, 0)
    }, [props.hotRef])

    const getSelectedPairs = (rangeArray) => {
        const allPairs = []
        for (const range of rangeArray) {
            const [startRow, startCol, endRow, endCol] = range
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) allPairs.push([row, col])
            }
        }
        return allPairs
    }

    useEffect(() => {
        props.hotRef.current?.destroy()

        function tcInRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcInValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        function tcOutRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcOutValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        function durationRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            durationValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance)
        }

        function textRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            if (arguments[5]) {
                td.style.fontSize = props.hotFontSize
                td.classList.add('td-custom-text')
            }
        }

        function checkboxRenderer(instance, td) {
            Handsontable.renderers.CheckboxRenderer.apply(this, arguments)
            td.classList.add('text-center')
        }

        function textLanguageRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            textValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        const customTextEditor = Handsontable.editors.TextEditor.prototype.extend();
        customTextEditor.prototype.init = function () {
            Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
            this.TEXTAREA_PARENT.addEventListener('keydown', (event) => {
                if (event.code === 'Space' && !this.isOpened()) {
                    event.stopPropagation()
                    props.playerRef.current.getInternalPlayer()?.paused ? props.playerRef.current.getInternalPlayer().play() : props.playerRef.current.getInternalPlayer()?.pause()
                }
            })
        }
        props.hotRef.current = new Handsontable(containerMain.current, {
            data: props.cellDataRef.current,
            columns: [{
                data: 'start',
                type: 'text',
                renderer: tcInRenderer,
                readOnly: props.tcLock,
                editor: customTextEditor
            }, {
                data: 'end',
                type: 'text',
                renderer: tcOutRenderer,
                readOnly: props.tcLock,
                editor: customTextEditor
            }, {
                data: 'duration', type: 'text', readOnly: true, renderer: durationRenderer
            }, {
                data: 'fn', type: 'checkbox', renderer: checkboxRenderer
            }, ...(props.languages.map((value) => ({
                data: `${value.code}_${value.counter}`,
                type: 'text',
                editor: customTextEditor,
                renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textLanguageRenderer : textRenderer
            })))],
            colHeaders: ['TC IN', 'TC OUT', 'DURATION', 'FN', ...(props.languages.map((value) => value.name)), 'error'],
            rowHeaders: true,
            width: props.size.width,
            height: props.size.height,
            minSpareRows: 2,
            readOnly: props.readOnly,
            contextMenu: props.readOnly ? false : {
                items: {
                    row_above: {},
                    row_below: {},
                    remove_row: {},
                    separator: Handsontable.plugins.ContextMenu.SEPARATOR,
                    undo: {},
                    redo: {},
                    separator2: Handsontable.plugins.ContextMenu.SEPARATOR,
                    make_read_only: {},
                    italic: {
                        name: 'Italic', callback: () => {
                            const newData = getSelectedPairs(props.hotRef.current.getSelected()).map(value => [...value, `<i>${props.hotRef.current.getDataAtCell(...value).replace(/<\/?i>/g, '')}</i>`])
                            props.hotRef.current.setDataAtCell(newData)
                        },
                    },
                    music_note: {
                        name: 'Music Note', callback: () => {
                            const newData = getSelectedPairs(props.hotRef.current.getSelected()).map(value => [...value, `♪ ${props.hotRef.current.getDataAtCell(...value).replace(/^♪+|♪+$/g, '').trim().replace(/[^\w\s]$/g, '')} ♪`])
                            props.hotRef.current.setDataAtCell(newData)
                        }
                    },
                    separator3: Handsontable.plugins.ContextMenu.SEPARATOR,
                    cut: {},
                    copy: {},
                    separator4: Handsontable.plugins.ContextMenu.SEPARATOR,
                    info: {
                        name: 'Info',
                        hidden: () => {
                            const selected = props.hotRef.current.getSelected()
                            return !props.taskHashedId || !(selected.length === 1 && selected[0][0] === selected[0][2] && selected[0][1] === selected[0][3])
                        },
                        callback: (key, selection) => {
                            const {row, col} = selection[0].start
                            props.crdt.yDoc().transact(() => {
                                const rows = props.crdt.yMap().get('cells')
                                const worker = rows.get(row).get(props.hotRef.current.colToProp(col))?.metadata.user.name
                                if (worker) alert(`최종 작업자: ${worker}`)
                            })
                        }
                    },
                }
            },
        })
        const autoRowSizePlugin = props.hotRef.current.getPlugin('autoRowSize');
        setTotalLines(getTotalLines())
        let grammarlyPlugin = null
        props.hotRef.current.addHook('afterBeginEditing', (row, column) => {
            if (props.hotRef.current.colToProp(column).startsWith('enUS')) {
                grammarly.then(r => {
                    grammarlyPlugin = r.addPlugin(containerMain.current.querySelector('textarea'), {
                        documentDialect: "american",
                    },)
                    containerMain.current.querySelector('grammarly-editor-plugin').style.setProperty('--grammarly-button-position-top', `${64 + 7 + props.size.height}px`)
                    containerMain.current.querySelector('grammarly-editor-plugin').style.setProperty('--grammarly-button-position-right', '100px')
                    containerMain.current.querySelector('grammarly-editor-plugin').querySelector('textarea').focus()
                });
            } else if (props.hotRef.current.colToProp(column).startsWith('arAE')) {
                containerMain.current.querySelector('textarea').dir = 'rtl'
            }
        })
        props.hotRef.current.addHook('beforeChange', (changes) => {
            changes.forEach(v => v[1] === 'fn' && (v[3] = Boolean(v[3]) || null))
        })
        props.hotRef.current.addHook('afterChange', (changes, source) => {
            if (props.taskHashedId) {
                if (source === 'sync') {
                    props.hotRef.current.undoRedo.doneActions.pop()
                } else {
                    props.crdt.yDoc().transact(() => {
                        const rows = props.crdt.yMap().get('cells')
                        const user = userRef.current.user
                        changes.forEach(change => {
                            if (change[2] !== change[3] && (change[2] || change[3])) {
                                rows.get(change[0])?.set(change[1], {
                                    value: change[3],
                                    metadata: {user: {id: user.id, name: user.name}}
                                })
                            }
                        })
                    }, 'local')
                }
            } else {
                localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            }
            if (props.waveformRef.current && source !== 'timelineWindow') {
                const tcChanges = changes.filter((value) => value[1] === 'start' || value[1] === 'end')
                if (tcChanges.length) {
                    if (tcChanges.length > 1) {
                        props.waveformRef.current.segments.removeAll()
                        props.waveformRef.current.segments.add(resetSegments())
                    } else {
                        const {rowId, start, end} = props.hotRef.current.getSourceDataAtRow(tcChanges[0][0])
                        if (tcChanges[0][3]) {
                            const [startSec, endSec] = [tcToSec(start), tcToSec(end)]
                            if (0 <= startSec && startSec <= endSec) {
                                const segment = props.waveformRef.current.segments.getSegment(rowId)
                                if (segment) segment.update({startTime: startSec, endTime: endSec})
                                else props.waveformRef.current.segments.add(createSegment(startSec, endSec, rowId))
                            } else {
                                props.waveformRef.current.segments.removeById(rowId)
                                props.selectedSegment.current = null
                            }
                        } else {
                            props.waveformRef.current.segments.removeById(rowId)
                            props.selectedSegment.current = null
                        }
                    }
                }
            }
            if (props.playerRef.current.getInternalPlayer()?.paused && changes.filter(value => value[0] === subtitleIndexRef.current).length) props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds') // update subtitle
            grammarlyPlugin?.disconnect()
            setTotalLines(getTotalLines())
        })
        props.hotRef.current.addHook('beforePaste', (data, coords) => {
            const newRows = Math.max(data.length + coords[0].startRow - props.hotRef.current.countRows(), 0)
            if (newRows) props.hotRef.current.alter('insert_row', props.hotRef.current.countRows(), newRows)
        })
        props.hotRef.current.addHook('afterCreateRow', (index, amount, source) => {
            if (props.taskHashedId) {
                props.crdt.yDoc().transact(() => {
                    const rows = props.crdt.yMap().get('cells')
                    const newRows = Array.from({length: amount}, () => {
                        const map = new Y.Map()
                        map.set('rowId', v4())
                        return map
                    })
                    rows.insert(index, newRows)
                })
            } else if (!props.taskHashedId) localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            setTotalLines(getTotalLines())
        })
        props.hotRef.current.addHook('beforeRemoveRow', (index, amount, physicalRows) => {
            if (props.waveformRef.current) {
                physicalRows.forEach((row) => {
                    props.waveformRef.current.segments.removeById(props.hotRef.current.getDataAtRowProp(row, 'rowId'))
                })
            }
        })
        props.hotRef.current.addHook('afterRemoveRow', (index, amount) => {
            if (props.taskHashedId) {
                props.crdt.yDoc().transact(() => {
                    const rows = props.crdt.yMap().get('cells')
                    rows.delete(index, amount)
                })
            } else if (!props.taskHashedId) localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            setTotalLines(getTotalLines())
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            props.hotSelectionRef.current.rowStart = Math.min(row, row2)
            props.hotSelectionRef.current.columnStart = Math.min(column, column2)
            props.hotSelectionRef.current.rowEnd = Math.max(row, row2)
            props.hotSelectionRef.current.columnEnd = Math.max(column, column2)
            const curSegment = props.waveformRef.current?.segments.getSegment(props.hotRef.current.getDataAtRowProp(row, 'rowId'))
            if (curSegment && curSegment !== props.selectedSegment.current) {
                props.selectedSegment.current?.update({color: 'white', editable: false})
                props.selectedSegment.current = curSegment
                props.selectedSegment.current.update({color: 'red', editable: !props.tcLock})
            }
        })
        props.hotRef.current.addHook('afterSelectionEndByProp', (row, prop, row2, prop2) => {
            props.crdt?.awareness()?.setLocalStateField('cursor', {row: row, colProp: prop})
        })
        props.hotRef.current.addHook('afterRenderer', (TD, row, column, prop, value, cellProperties) => {
            if (cellProperties.awareness) {
                const borderDiv = document.createElement('div')
                TD.classList.add('td-custom-container')
                borderDiv.className = 'td-custom-border'
                borderDiv.style.border = `2px solid ${cellProperties.awareness.color}`
                borderDiv.style.width = borderDiv.style.height = 'calc(100% - 4px)'
                const nameDiv = document.createElement('div')
                nameDiv.className = 'td-custom-name'
                nameDiv.style.backgroundColor = cellProperties.awareness.color
                nameDiv.innerHTML = cellProperties.awareness.name
                TD.append(borderDiv, nameDiv)
            }
            if (column === props.hotRef.current.countCols() - 1 && cellProperties.subtitle) {
                TD.parentNode.childNodes.forEach(child => child.classList.add('td-custom-highlight'))
            }
        })
        props.hotRef.current.addHook('afterSetCellMeta', () => debounceRender())
        props.hotRef.current.addHook('afterRemoveCellMeta', () => debounceRender())
        return () => {
            persistentRowIndexRef.current = autoRowSizePlugin.getFirstVisibleRow()
        }
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.crdt, props.hotRef, props.hotSelectionRef, props.tcLock, props.playerRef, props.waveformRef, props.guideline, props.selectedSegment, afterRenderPromise, resetSegments, debounceRender, getTotalLines, props.taskHashedId, props.readOnly])

    useEffect(() => {
        props.hotRef.current.scrollViewportTo(persistentRowIndexRef.current)
        props.hotRef.current.undoRedo.doneActions = persistentUndoRedoRef.current.doneActions
        props.hotRef.current.undoRedo.undoneActions = persistentUndoRedoRef.current.undoneActions
        props.hotRef.current.updateSettings({manualColumnResize: [99, 99, 75, 25, ...Array.from({length: props.languages.length}, () => Math.floor((props.size.width - 365) / props.languages.length))]})
        props.hotRef.current.setCellMeta(subtitleIndexRef.current, props.hotRef.current.countCols() - 1, 'subtitle', true)
        Object.entries(userCursorsRef.current).forEach(([, aw]) => {
            if (aw.cursor) props.hotRef.current.setCellMeta(aw.cursor.row, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness', aw.user)
        })
    }, [props.hotRef, props.size, props.languages, props.tcLock, props.hotFontSize]);

    useEffect(() => {
        // highlight current subtitle
        if (subtitleIndexRef.current > -1) props.hotRef.current.removeCellMeta(subtitleIndexRef.current, props.hotRef.current.countCols() - 1, 'subtitle')
        subtitleIndexRef.current = props.subtitleIndex
        props.hotRef.current.setCellMeta(subtitleIndexRef.current, props.hotRef.current.countCols() - 1, 'subtitle', true)
    }, [props.subtitleIndex, props.hotRef])

    useEffect(() => {
        if (props.crdtAwarenessInitialized) {
            const awareness = props.crdt.awareness()
            const user = awareness.getStates().get(props.crdt.yDoc().clientID)
            userCursorsRef.current[props.crdt.yDoc().clientID] = userRef.current = user
            awareness.on('change', ({added, removed, updated}) => {
                const states = awareness.getStates()
                added.forEach(id => {
                    const aw = userCursorsRef.current[id] = states.get(id)
                    if (aw.cursor) props.hotRef.current.setCellMeta(aw.cursor.row, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness', aw.user)
                })
                removed.forEach(id => {
                    const prevCursor = userCursorsRef.current[id]?.cursor
                    if (prevCursor) props.hotRef.current.removeCellMeta(prevCursor.row, props.hotRef.current.propToCol(prevCursor.colProp), 'awareness')
                    userCursorsRef.current = Object.fromEntries(Object.entries(userCursorsRef.current).filter(value => value[0] !== `${id}`))
                })
                updated.forEach(id => {
                    if (id === props.crdt.yDoc().clientID) return
                    const prevCursor = userCursorsRef.current[id]?.cursor
                    if (prevCursor) props.hotRef.current.removeCellMeta(prevCursor.row, props.hotRef.current.propToCol(prevCursor.colProp), 'awareness')
                    const aw = userCursorsRef.current[id] = states.get(id)
                    if (aw.cursor) props.hotRef.current.setCellMeta(aw.cursor.row, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness', aw.user)
                })
            })
        } else {
            Object.entries(userCursorsRef.current).forEach(([, aw]) => {
                if (aw.cursor) props.hotRef.current.removeCellMeta(aw.cursor.row, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness')
            })
            userCursorsRef.current = {}
        }
    }, [props.crdtAwarenessInitialized, props.crdt, props.hotRef])

    return <div className={'position-relative'} style={{height: 'calc(100% - 40px)'}}>
        <div ref={containerMain} style={{zIndex: 0}} onClick={() => props.focusedRef.current = props.hotRef.current}/>
        <MDBBtn className={'position-absolute'} style={{bottom: '1.5rem', right: '1.5rem', padding: '0.75rem'}}
                color={'info'} rounded onClick={() => props.hotRef.current.scrollViewportTo(totalLines - 1)}>
            <MDBIcon fas icon="arrow-down"/>&nbsp;{totalLines}
        </MDBBtn>
    </div>
}

export default LanguageWindow
