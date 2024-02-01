import '../../../css/Handsontable.css'
import '../../../css/HandsontableCustom.css'
import {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from "react";
import {
    durationValidator,
    SCRIPT_COLUMN,
    tcInValidator,
    tcOutValidator,
    textValidator
} from "../../../utils/hotRenderer";
import {createSegment, tcToSec} from "../../../utils/functions";
import {v4} from "uuid";
import {MDBBtn, MDBIcon} from "mdb-react-ui-kit";
import * as Y from "yjs";

const LanguageWindow = forwardRef(({resetSegments, ...props}, ref) => {
    const containerMain = useRef(null);
    const [totalLines, setTotalLines] = useState(0)
    const debounceTimeoutRef = useRef(null)
    const persistentRowIndexRef = useRef(0);
    const persistentUndoRedoRef = useRef({doneActions: [], undoneActions: []})
    const subtitleIndexRef = useRef(-1)
    const userCursorsRef = useRef({})
    const userRef = useRef(null)

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

    const updateUserCursors = useCallback((index, amount) => {
        for (let key in userCursorsRef.current) {
            const aw = userCursorsRef.current[key]
            if (aw.cursor) {
                const prevRow = aw.cursor.row
                const curRow = aw.cursor.row - amount
                if (index <= prevRow && prevRow <= props.hotRef.current.countRows() + amount) {
                    props.hotRef.current.removeCellMeta(prevRow, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness')
                }
                if (prevRow < props.hotRef.current.countRows()) {
                    if (index < prevRow) props.hotRef.current.setCellMeta(curRow, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness', aw.user)
                    else if (index === prevRow) setTimeout(() => props.hotRef.current.setCellMeta(prevRow, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness', aw.user), 200)
                }
            }
        }
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

    useImperativeHandle(ref, () => ({
        setTotalLines: () => setTotalLines(getTotalLines())
    }), [getTotalLines])

    useEffect(() => {
        props.hotRef.current?.destroy()

        function tcInRenderer(instance, td) {
            window.Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcInValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        function tcOutRenderer(instance, td) {
            window.Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcOutValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        function durationRenderer(instance, td) {
            window.Handsontable.renderers.TextRenderer.apply(this, arguments)
            durationValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        function checkboxRenderer(instance, td) {
            window.Handsontable.renderers.CheckboxRenderer.apply(this, arguments)
            td.classList.add('text-center')
        }

        function textRenderer(instance, td) {
            window.Handsontable.renderers.TextRenderer.apply(this, arguments)
            if (arguments[5]) {
                td.style.fontSize = props.hotFontSize
                td.classList.add('td-custom-text')
            }
        }

        function textLanguageRenderer(instance, td) {
            window.Handsontable.renderers.TextRenderer.apply(this, arguments)
            textValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance, props.guideline)
        }

        const languageTextEditor = window.Handsontable.editors.TextEditor.prototype.extend();
        languageTextEditor.prototype.init = function () {
            window.Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
            this.TEXTAREA.addEventListener('input', (event) => this.col === SCRIPT_COLUMN && this.state === 'STATE_EDITING' && props.selectedSegment.current?.update({labelText: event.target.value}))
        }
        languageTextEditor.prototype.finishEditing = function (revertToOriginal) {
            window.Handsontable.editors.TextEditor.prototype.finishEditing.apply(this, arguments);
            if (this.col === SCRIPT_COLUMN && revertToOriginal) props.selectedSegment.current?.update({labelText: this.originalValue || ''})
        }

        props.hotRef.current = new window.Handsontable(containerMain.current, {
            data: props.cellDataRef.current,
            columns: [{
                data: 'start',
                type: 'text',
                renderer: tcInRenderer,
                readOnly: props.tcLock,
            }, {
                data: 'end',
                type: 'text',
                renderer: tcOutRenderer,
                readOnly: props.tcLock,
            }, {
                data: 'duration', type: 'text', readOnly: true, renderer: durationRenderer
            }, {
                data: 'fn', type: 'checkbox', renderer: checkboxRenderer
            }, ...(props.languages.map((value) => ({
                data: `${value.code}_${value.counter}`,
                type: 'text',
                editor: languageTextEditor,
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
                    separator: window.Handsontable.plugins.ContextMenu.SEPARATOR,
                    undo: {},
                    redo: {},
                    separator2: window.Handsontable.plugins.ContextMenu.SEPARATOR,
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
                    separator3: window.Handsontable.plugins.ContextMenu.SEPARATOR,
                    cut: {},
                    copy: {},
                    separator4: window.Handsontable.plugins.ContextMenu.SEPARATOR,
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
        const totalLines = getTotalLines()
        setTotalLines(totalLines)
        props.hotRef.current.updateSettings({copyPaste: {rowsLimit: totalLines}})
        props.hotRef.current.addHook('afterBeginEditing', (row, column) => {
            if (!props.hotRef.current.getActiveEditor().isInFullEditMode()) props.hotRef.current.getActiveEditor().enableFullEditMode()
            if (props.hotRef.current.colToProp(column).startsWith('arAE')) {
                containerMain.current.querySelector('textarea').dir = 'rtl'
            }
        })
        props.hotRef.current.addHook('beforeChange', (changes, source) => {
            if (source === 'edit' && props.hotRef.current.getActiveEditor()?.state === 'STATE_EDITING') props.hotRef.current.getActiveEditor().finishEditing() // setDataAtCell called while editing
            changes.forEach(v => {
                if (v[1] === 'fn') (v[3] = Boolean(v[3]) || null)
                else v[3] = v[3]?.replaceAll('|', '\n')
            })
        })
        props.hotRef.current.addHook('afterChange', (changes, source) => {
            if (props.taskHashedId) {
                if (source === 'sync') props.hotRef.current.undoRedo.doneActions.pop()
                else {
                    const index = [0]
                    const user = userRef.current.user;
                    while (index[0] < changes.length) {
                        props.crdt.yDoc().transact(() => {
                            let counter = 0
                            const rows = props.crdt.yMap().get('cells');
                            while (index[0] < changes.length && counter < 500) {
                                const change = changes[index[0]]
                                if (change[2] !== change[3] && (change[2] || change[3])) {
                                    rows.get(change[0])?.set(change[1], {
                                        value: change[3], metadata: {user: {id: user.id, name: user.name}}
                                    });
                                    counter++
                                }
                                index[0]++
                            }
                        }, 'local');
                    }
                }
            } else localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            if (props.waveformRef.current && source !== 'timelineWindow') {
                const languageKey = props.languages.length ? `${props.languages[0].code}_${props.languages[0].counter}` : null
                const tcChanges = changes.reduce((acc, v) => {
                    if (v[1] === 'start' || v[1] === 'end' || v[1] === languageKey) {
                        if (!acc.hasOwnProperty(v[0])) acc[v[0]] = {}
                        acc[v[0]][v[1]] = v[3]
                    }
                    return acc
                }, {})
                const rowKeys = Object.keys(tcChanges)
                if (rowKeys.length > 1) {
                    props.waveformRef.current.segments.removeAll()
                    props.waveformRef.current.segments.add(resetSegments())
                } else if (rowKeys.length === 1) {
                    const {
                        rowId, start, end, [languageKey]: text
                    } = props.hotRef.current.getSourceDataAtRow(Number(rowKeys[0]))
                    const [startSec, endSec] = [tcToSec(start), tcToSec(end)]
                    if (startSec < endSec) {
                        const segment = props.waveformRef.current.segments.getSegment(rowId)
                        if (segment) segment.update({startTime: startSec, endTime: endSec, labelText: text || ''})
                        else props.waveformRef.current.segments.add(createSegment(startSec, endSec, rowId, text || '', !props.tcLock))
                    } else {
                        props.waveformRef.current.segments.removeById(rowId)
                        props.selectedSegment.current = null
                    }
                }
            }
            if (props.playerRef.current.getInternalPlayer()?.paused && changes.filter(value => value[0] === subtitleIndexRef.current).length) props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds') // update subtitle
            if (source === 'UndoRedo.undo' || source === 'UndoRedo.redo') {
                const selects = [];
                let currentGroup = null;

                for (const [row, prop, ,] of changes) {
                    const col = props.hotRef.current.propToCol(prop);
                    currentGroup = [row, col, row, col]
                }

                if (currentGroup) selects.push(currentGroup)
                props.hotRef.current.selectCells(selects)
            }
            setTotalLines(getTotalLines())
        })
        props.hotRef.current.addHook('beforePaste', (data, coords) => {
            const newRows = Math.max(data.length + coords[0].startRow - props.hotRef.current.countRows(), 0)
            if (newRows) props.hotRef.current.alter('insert_row', props.hotRef.current.countRows(), newRows)
        })
        props.hotRef.current.addHook('afterUndo', (action) => {
            if (action.actionType === 'insert_row' || action.actionType === 'remove_row') props.hotRef.current.selectCell(action.index, 0, action.index + action.data.length - 1, props.hotRef.current.countCols() - 1)
        })
        props.hotRef.current.addHook('afterRedo', (action) => {
            if (action.actionType === 'insert_row' || action.actionType === 'remove_row') props.hotRef.current.selectCell(action.index, 0, action.index + action.data.length - 1, props.hotRef.current.countCols() - 1)
        })
        props.hotRef.current.addHook('beforeCreateRow', (index, amount) => {
            if (props.taskHashedId) updateUserCursors(index, amount)
        })
        props.hotRef.current.addHook('afterCreateRow', (index, amount) => {
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
            } else {
                props.cellDataRef.current.splice(index, amount, ...Array.from({length: amount}, () => ({rowId: v4()})))
                localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            }
            const totalLines = getTotalLines()
            setTotalLines(totalLines)
            props.hotRef.current.updateSettings({copyPaste: {rowsLimit: totalLines}})
        })
        props.hotRef.current.addHook('beforeRemoveRow', (index, amount, physicalRows) => {
            if (props.waveformRef.current) physicalRows.forEach((row) => props.waveformRef.current.segments.removeById(props.hotRef.current.getDataAtRowProp(row, 'rowId')))
            if (props.taskHashedId) updateUserCursors(index, -amount)
        })
        props.hotRef.current.addHook('afterRemoveRow', (index, amount) => {
            if (props.taskHashedId) {
                props.crdt.yDoc().transact(() => {
                    const rows = props.crdt.yMap().get('cells')
                    rows.delete(index, amount)
                })
            } else localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            setTotalLines(getTotalLines())
        })
        props.hotRef.current.addHook('afterSelection', (row, column, row2, column2) => {
            props.hotSelectionRef.current = {rowStart: row, columnStart: column, rowEnd: row2, columnEnd: column2}
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            const curSegment = props.waveformRef.current?.segments.getSegment(props.hotRef.current.getDataAtRowProp(row, 'rowId'))
            if (curSegment && curSegment !== props.selectedSegment.current) {
                props.selectedSegment.current?.update({color: 'white'})
                props.selectedSegment.current = curSegment
                props.selectedSegment.current.update({color: 'red'})
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
            if (column === props.hotRef.current.countCols() - 1 && cellProperties.subtitle) TD.parentNode.childNodes.forEach(child => child.classList.add('td-custom-highlight'))
        })
        props.hotRef.current.addHook('afterSetCellMeta', () => debounceRender())
        props.hotRef.current.addHook('afterRemoveCellMeta', () => debounceRender())
        return () => {
            persistentRowIndexRef.current = autoRowSizePlugin.getFirstVisibleRow()
        }
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.crdt, props.hotRef, props.hotSelectionRef, props.tcLock, props.playerRef, props.waveformRef, props.guideline, props.selectedSegment, resetSegments, debounceRender, getTotalLines, updateUserCursors, props.taskHashedId, props.readOnly])

    useEffect(() => {
        props.hotRef.current.scrollViewportTo(persistentRowIndexRef.current)
        props.hotRef.current.undoRedo.doneActions = persistentUndoRedoRef.current.doneActions
        props.hotRef.current.undoRedo.undoneActions = persistentUndoRedoRef.current.undoneActions
        props.hotRef.current.updateSettings({manualColumnResize: [99, 99, 75, 25, ...Array.from({length: props.languages.length}, () => Math.floor((props.size.width - 365) / props.languages.length))]})
        props.hotRef.current.setCellMeta(subtitleIndexRef.current, props.hotRef.current.countCols() - 1, 'subtitle', true)
        Object.entries(userCursorsRef.current).forEach(([, aw]) => aw.cursor && props.hotRef.current.setCellMeta(aw.cursor.row, props.hotRef.current.propToCol(aw.cursor.colProp), 'awareness', aw.user))
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
            userRef.current = awareness.getStates().get(props.crdt.yDoc().clientID)
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
                    if (prevCursor && prevCursor.row < props.hotRef.current.countRows()) {
                        props.hotRef.current.removeCellMeta(prevCursor.row, props.hotRef.current.propToCol(prevCursor.colProp), 'awareness')
                    }
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
        <div ref={containerMain} style={{zIndex: 0}}/>
        <MDBBtn className={'position-absolute'} style={{bottom: '1.5rem', right: '1.5rem', padding: '0.75rem'}}
                color={'info'} rounded onClick={() => props.hotRef.current.scrollViewportTo(totalLines - 1)}>
            <MDBIcon fas icon="arrow-down"/>&nbsp;{totalLines}
        </MDBBtn>
    </div>
})

export default LanguageWindow
