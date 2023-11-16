import Handsontable from 'handsontable';
import '../../../css/Handsontable.css'
import * as Grammarly from '@grammarly/editor-sdk'
import {useCallback, useEffect, useRef, useState} from "react";
import {durationValidator, tcInValidator, tcOutValidator, textValidator} from "../../../utils/hotRenderer";
import {createSegment, tcToSec} from "../../../utils/functions";
import {v4} from "uuid";
import {MDBBtn, MDBIcon} from "mdb-react-ui-kit";

const grammarly = (async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn"))()


const LanguageWindow = ({resetSegments, ...props}) => {
    const containerMain = useRef(null);
    const [totalLines, setTotalLines] = useState(0)

    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const afterRenderCallback = () => resolve()
            props.hotRef.current?.addHookOnce('afterRender', afterRenderCallback)
        })
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

    const selectRows = useCallback(() => {
        if (props.playerRef.current.getInternalPlayer() && !props.hotRef.current.getActiveEditor()?._opened) {
            const row = props.subtitleIndexRef.current
            const [start, end] = props.hotRef.current.getDataAtRow(row).slice(0, 2)
            const currentTime = props.playerRef.current.getCurrentTime()?.toFixed(3)
            if (currentTime >= tcToSec(start) && currentTime <= tcToSec(end)) { // if not editing
                if (!props.hotRef.current.getSelected()) props.hotRef.current.selectRows(row)
            }
        }
    }, [props.hotRef, props.subtitleIndexRef, props.playerRef])

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
                td.classList.add('td-custom')
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
        // TODO tcLockRef bug fix - readOnly prevents createRow
        props.hotRef.current = new Handsontable(containerMain.current, {
            data: props.cellDataRef.current,
            columns: [{
                data: 'start',
                type: 'text',
                renderer: tcInRenderer,
                readOnly: props.tcLockRef.current,
                editor: customTextEditor
            }, {
                data: 'end',
                type: 'text',
                renderer: tcOutRenderer,
                readOnly: props.tcLockRef.current,
                editor: customTextEditor
            }, {
                data: 'duration', type: 'text', readOnly: true, renderer: durationRenderer
            }, {
                data: 'fn', type: 'checkbox', renderer: checkboxRenderer,
            }, ...(props.languages.map((value) => ({
                data: `${value.code}_${value.counter}`,
                type: 'text',
                editor: customTextEditor,
                renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textLanguageRenderer : textRenderer
            })))],
            manualColumnResize: true,
            colHeaders: ['TC In', 'TC Out', 'Duration', 'FN', ...(props.languages.map((value) => value.name)), 'error'],
            rowHeaders: true,
            width: props.size.width,
            height: props.size.height,
            minSpareRows: 2,
            contextMenu: {
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
                    copy: {}
                }
            },
        })
        setTotalLines(getTotalLines())
        let grammarlyPlugin = null
        props.hotRef.current.addHook('afterScrollVertically', selectRows)
        props.hotRef.current.addHook('afterScrollHorizontally', selectRows)
        props.hotRef.current.addHook('afterBeginEditing', (row, column) => {
            if (props.hotRef.current.colToProp(column).startsWith('enUS')) {
                grammarly.then(r => {
                    grammarlyPlugin = r.addPlugin(containerMain.current.querySelector('textarea'), {
                        documentDialect: "american",
                    },)
                    containerMain.current.querySelector('grammarly-editor-plugin').querySelector('textarea').focus()
                });
            } else if (props.hotRef.current.colToProp(column).startsWith('arAE')) {
                containerMain.current.querySelector('textarea').dir = 'rtl'
            }
            const tcIn = props.hotRef.current.getDataAtCell(row, 0)
            props.isFromLanguageWindowRef.current = true
            if (tcIn) props.playerRef.current.seekTo(tcToSec(tcIn), 'seconds')
        })
        props.hotRef.current.addHook('beforeChange', (changes) => {
            changes.forEach(v => v[1] === 'fn' && (v[3] = Boolean(v[3]) || null))
        })
        props.hotRef.current.addHook('afterChange', (changes, source) => {
            localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            if (!props.waveformRef.current || source === 'timelineWindow') return
            const tcChanges = changes.filter((value) => value[1] === 'start' || value[1] === 'end')
            if (tcChanges.length) {
                if (tcChanges.length > 1) {
                    props.waveformRef.current.segments.removeAll()
                    props.waveformRef.current.segments.add(resetSegments())
                } else {
                    if (tcChanges[0][2]) {
                        const {rowId} = props.hotRef.current.getSourceDataAtRow(tcChanges[0][0])
                        props.waveformRef.current.segments.removeById(rowId)
                        props.selectedSegment.current = null
                    }
                    if (tcChanges[0][3]) {
                        const {rowId, start, end} = props.hotRef.current.getSourceDataAtRow(tcChanges[0][0])
                        const [startSec, endSec] = [tcToSec(start), tcToSec(end)]
                        0 <= startSec && endSec && props.waveformRef.current.segments.add(createSegment(startSec, endSec, rowId))
                    }
                }
            }
            if (props.hotRef.current.getActiveEditor()?._opened) {
                props.isFromLanguageWindowRef.current = true
                props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds') // update subtitle
            }
            grammarlyPlugin?.disconnect()
            setTotalLines(getTotalLines())
        })
        // TODO create row source === CopyPaste.paste performance
        props.hotRef.current.addHook('beforeCreateRow', (index, amount) => {
            afterRenderPromise().then(() => {
                for (let i = 0; i < 2; i++) {
                    for (let j = index; j < index + amount; j++) props.hotRef.current.getCellMeta(j, i).readOnly = props.tcLockRef.current
                }
                props.hotRef.current.render()
            })
        })
        props.hotRef.current.addHook('afterCreateRow', (index, amount) => {
            for (let i = index; i < index + amount; i++) {
                props.hotRef.current.setDataAtRowProp(i, 'rowId', v4())
            }
            !props.taskHashedId && localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            setTotalLines(getTotalLines())
        })
        props.hotRef.current.addHook('beforeRemoveRow', (index, amount, physicalRows) => {
            if (props.waveformRef.current) {
                physicalRows.forEach((row) => {
                    props.waveformRef.current.segments.removeById(props.hotRef.current.getDataAtRowProp(row, 'rowId'))
                })
            }
        })
        props.hotRef.current.addHook('afterRemoveRow', () => {
            setTotalLines(getTotalLines())
            localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            props.hotSelectionRef.current.rowStart = Math.min(row, row2)
            props.hotSelectionRef.current.columnStart = Math.min(column, column2)
            props.hotSelectionRef.current.rowEnd = Math.max(row, row2)
            props.hotSelectionRef.current.columnEnd = Math.max(column, column2)
        })
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.dataInitialized, props.hotRef, props.hotSelectionRef, props.playerRef, props.tcLockRef, props.waveformRef, props.isFromLanguageWindowRef, props.guideline, props.selectedSegment, afterRenderPromise, resetSegments, getTotalLines, selectRows, props.taskHashedId])

    useEffect(() => {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < props.hotRef.current.countRows(); j++) props.hotRef.current.getCellMeta(j, i).readOnly = props.tcLock
        }
        props.hotRef.current.render()
    }, [props.tcLock, props.hotRef])

    return <div className={'position-relative'} style={{height: 'calc(100% - 40px)'}}>
        <div ref={containerMain} style={{zIndex: 0}} onClick={() => props.focusedRef.current = props.hotRef.current}/>
        <MDBBtn className={'position-absolute'} style={{bottom: '1.5rem', right: '1.5rem', padding: '0.75rem'}}
                color={'info'} rounded onClick={() => props.hotRef.current.scrollViewportTo(totalLines - 1)}>
            <MDBIcon fas icon="arrow-down"/>&nbsp;{totalLines}
        </MDBBtn>
    </div>
}

export default LanguageWindow
