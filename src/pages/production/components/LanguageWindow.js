import Handsontable from 'handsontable';
import '../../../css/Handsontable.css'
import * as Grammarly from '@grammarly/editor-sdk'
import {useCallback, useEffect, useRef, useState} from "react";
import {tcInValidator, tcOutValidator, textValidator} from "../../../utils/hotRenderer";
import {createSegment, tcToSec} from "../../../utils/functions";
import {v4} from "uuid";
import {MDBBtn, MDBIcon} from "mdb-react-ui-kit";

const grammarly = (async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn"))()


const LanguageWindow = (props) => {
    const containerMain = useRef(null);
    const [totalLines, setTotalLines] = useState(0)

    const resetSegments = useRef(null)
    useEffect(() => {
        resetSegments.current = props.resetSegments
    }, [props.resetSegments])

    const afterRenderPromise = useCallback(() => {
        return new Promise(resolve => {
            const afterRenderCallback = () => {
                props.hotRef.current.removeHook('afterRender', afterRenderCallback)
                resolve()
            }
            props.hotRef.current?.addHookOnce('afterRender', afterRenderCallback)
        })
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

        function textRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            td.innerHTML = `<span style="text-overflow: ellipsis; display: block; white-space: pre; overflow: hidden; font-size: ${props.hotFontSize}">${arguments[5]}</span>`
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
                    if (props.playerRef.current.getInternalPlayer()?.paused) props.playerRef.current.getInternalPlayer().play()
                    else props.playerRef.current.getInternalPlayer()?.pause()
                }
            })
        }
        props.hotRef.current = new Handsontable(containerMain.current, {
            data: !props.fnToggle ? props.cellDataRef.current : props.fnRef.current,
            columns: [
                {
                    data: 'start',
                    type: 'text',
                    renderer: tcInRenderer,
                    readOnly: props.tcLockRef.current,
                    editor: customTextEditor
                },
                {
                    data: 'end',
                    type: 'text',
                    renderer: tcOutRenderer,
                    readOnly: props.tcLockRef.current,
                    editor: customTextEditor
                },
                ...(!props.fnToggle ? props.languages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textLanguageRenderer : textRenderer,
                        editor: customTextEditor
                    }
                }) : props.fnLanguages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textLanguageRenderer : textRenderer,
                        editor: customTextEditor
                    }
                }))
            ],
            manualColumnResize: true,
            colHeaders: ['TC_IN', 'TC_OUT', ...(!props.fnToggle ? props.languages.map((value) => value.name) : props.fnLanguages.map((value) => value.name)), 'error'],
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
        const getTotalLines = () => {
            const data = props.hotRef.current.getData()
            let totalLines = -1
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].filter(v => v).length > 0) {
                    totalLines = i
                    break
                }
            }
            return Math.max(totalLines + 1, 0)
        }
        setTotalLines(getTotalLines())
        let grammarlyPlugin = null
        const selectRows = () => {
            if (props.playerRef.current.getInternalPlayer() && !props.hotRef.current.getActiveEditor()?._opened) {
                const row = !props.fnToggle ? props.subtitleIndexRef.current : props.fnIndexRef.current
                const [start, end] = props.hotRef.current.getDataAtRow(row).slice(0, 2)
                const currentTime = props.playerRef.current.getCurrentTime().toFixed(3)
                if (currentTime >= tcToSec(start) && currentTime <= tcToSec(end)) {
                    if (!props.hotRef.current.getSelected()) props.hotRef.current.selectRows(row)
                }
            }
        }
        props.hotRef.current.addHook('afterScrollVertically', selectRows)
        props.hotRef.current.addHook('afterScrollHorizontally', selectRows)
        props.hotRef.current.addHook('afterBeginEditing', (row, column) => {
            props.hotRef.current.render()
            if (props.hotRef.current.colToProp(column).startsWith('enUS')) {
                grammarly.then(r => {
                    grammarlyPlugin = r.addPlugin(
                        containerMain.current.querySelector('textarea'),
                        {
                            documentDialect: "american",
                        },
                    )
                    containerMain.current.querySelector('grammarly-editor-plugin').querySelector('textarea').focus()
                });
            } else if (props.hotRef.current.colToProp(column).startsWith('arAE')) {
                containerMain.current.querySelector('textarea').dir = 'rtl'
            }
            const tcIn = props.hotRef.current.getDataAtCell(row, 0)
            props.isFromLanguageWindowRef.current = true
            if (tcIn) props.playerRef.current.seekTo(tcToSec(tcIn), 'seconds')
        })
        props.hotRef.current.addHook('beforeChange', () => {
            if (props.hotRef.current.getActiveEditor()?._opened) {
                props.isFromLanguageWindowRef.current = true
                props.playerRef.current.seekTo(props.playerRef.current.getCurrentTime(), 'seconds')
            }
        })
        props.hotRef.current.addHook('afterChange', (changes, source) => {
            grammarlyPlugin?.disconnect()
            setTotalLines(getTotalLines())
            !props.fnToggle ? localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current)) : localStorage.setItem('fn', JSON.stringify(props.fnRef.current))
            if (props.isFromTimelineWindowRef.current) {
                props.isFromTimelineWindowRef.current = false
                return
            }
            if (!props.waveformRef.current) return
            const tcChanges = changes.filter((value) => value[1] === 'start' || value[1] === 'end')
            if (tcChanges.length) {
                if (tcChanges.length > 1) {
                    props.waveformRef.current.segments.removeAll()
                    props.waveformRef.current.segments.add(resetSegments.current())
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
        })
        props.hotRef.current.addHook('afterCreateRow', (index, amount) => {
            if (!props.fnToggle) {
                for (let i = index; i < index + amount; i++) {
                    props.cellDataRef.current[i].rowId = v4()
                }
                localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            } else {
                for (let i = index; i < index + amount; i++) {
                    props.fnRef.current[i].rowId = v4()
                }
                localStorage.setItem('fn', JSON.stringify(props.fnRef.current))
            }
            props.hotRef.current.render()
            afterRenderPromise().then(() => {
                for (let i = 0; i < 2; i++) {
                    for (let j = index; j < index + amount; j++) props.hotRef.current.getCellMeta(j, i).readOnly = props.tcLockRef.current
                }
            })
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
            !props.fnToggle ? localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current)) : localStorage.setItem('fn', JSON.stringify(props.fnRef.current))
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            props.hotSelectionRef.current.rowStart = Math.min(row, row2)
            props.hotSelectionRef.current.columnStart = Math.min(column, column2)
            props.hotSelectionRef.current.rowEnd = Math.max(row, row2)
            props.hotSelectionRef.current.columnEnd = Math.max(column, column2)
        })
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.hotRef, props.hotSelectionRef, props.playerRef, props.tcLockRef, props.fnToggle, props.fnRef, props.fnLanguages, props.waveformRef, props.isFromTimelineWindowRef, props.isFromLanguageWindowRef, props.guideline, props.selectedSegment, afterRenderPromise, props.subtitleIndexRef, props.fnIndexRef])

    useEffect(() => {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < props.hotRef.current.countRows(); j++) props.hotRef.current.getCellMeta(j, i).readOnly = props.tcLock
        }
        props.hotRef.current.render()
    }, [props.tcLock, props.hotRef])

    return <div className={'position-relative'} style={{height: 'calc(100% - 40px)'}}>
        <div ref={containerMain} style={{zIndex: 0}}
             onClick={(event) => props.focusedRef.current = props.hotRef.current}/>
        <MDBBtn className={'position-absolute'} style={{bottom: '1.5rem', right: '1.5rem', padding: '0.75rem'}}
                color={'info'} rounded onClick={() => props.hotRef.current.scrollViewportTo(totalLines - 1)}>
            <MDBIcon fas icon="arrow-down"/>&nbsp;{totalLines}
        </MDBBtn>
    </div>
}

export default LanguageWindow
