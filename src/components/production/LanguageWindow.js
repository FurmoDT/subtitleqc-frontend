import Handsontable from 'handsontable';
import '../../css/Handsontable.css'
import * as Grammarly from '@grammarly/editor-sdk'
import {useEffect, useRef} from "react";
import {tcInValidator, tcOutValidator, textValidator} from "../../utils/hotRenderer";
import {createSegment, tcToSec} from "../../utils/functions";
import {v4} from "uuid";

const grammarly = (async () => await Grammarly.init("client_3a8upV1a1GuH7TqFpd98Sn"))()


const LanguageWindow = (props) => {
    const containerMain = useRef(null);

    useEffect(() => {
        props.hotRef.current?.destroy()

        function tcInRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcInValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance)
        }

        function tcOutRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            tcOutValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize, instance)
        }

        function textRenderer(instance, td) {
            Handsontable.renderers.TextRenderer.apply(this, arguments)
            textValidator(arguments[2], arguments[3], arguments[5], td, props.hotFontSize)
        }

        props.hotRef.current = new Handsontable(containerMain.current, {
            data: !props.fxToggle ? props.cellDataRef.current : props.fxRef.current,
            columns: [
                {data: 'start', type: 'text', renderer: tcInRenderer},
                {data: 'end', type: 'text', renderer: tcOutRenderer},
                ...(!props.fxToggle ? props.languages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textRenderer : 'text'
                    }
                }) : props.fxLanguages.map((value) => {
                    return {
                        data: `${value.code}_${value.counter}`, type: 'text',
                        renderer: value.code.match(/^[a-z]{2}[A-Z]{2}$/) ? textRenderer : 'text'
                    }
                }))
                // {data: 'error', type: 'text'},
            ],
            manualColumnResize: true,
            colHeaders: ['TC_IN', 'TC_OUT', ...(!props.fxToggle ? props.languages.map((value) => value.name) : props.fxLanguages.map((value) => value.name)), 'error'],
            rowHeaders: true,
            width: props.size.width,
            height: props.size.languageWindowHeight,
            minSpareRows: 2,
            contextMenu: ['row_above', 'row_below', 'remove_row'],
        })
        let grammarlyPlugin = null
        props.hotRef.current.addHook('afterBeginEditing', (row) => {
            grammarly.then(r => {
                grammarlyPlugin = r.addPlugin(
                    containerMain.current.querySelector('textarea'),
                    {
                        documentDialect: "american",
                    },
                )
                containerMain.current.querySelector('grammarly-editor-plugin').querySelector('textarea').focus()
            });
            const tcIn = props.hotRef.current.getDataAtCell(row, 0)
            if (tcIn) props.playerRef.current.seekTo(tcToSec(tcIn), 'seconds')
        })
        props.hotRef.current.addHook('afterChange', (changes) => {
            grammarlyPlugin?.disconnect()
            !props.fxToggle ? localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current)) : localStorage.setItem('fx', JSON.stringify(props.fxRef.current))
            if (props.isFromTimelineWindowRef.current) {
                props.isFromTimelineWindowRef.current = false
                return
            }
            changes.forEach((change) => {
                if (change[1] === 'start') {
                    const rowId = props.hotRef.current.getDataAtRowProp(change[0], 'rowId')
                    const start = tcToSec(change[3])
                    if (start) {
                        const segment = props.waveformRef.current.segments.getSegment(rowId)
                        if (segment) segment.update({startTime: start})
                        else {
                            const end = tcToSec(props.hotRef.current.getDataAtRowProp(change[0], 'end'))
                            if (end) props.waveformRef.current.segments.add(createSegment(start, end, rowId))
                        }
                    } else props.waveformRef.current.segments.removeById(rowId)
                } else if (change[1] === 'end') {
                    const rowId = props.hotRef.current.getDataAtRowProp(change[0], 'rowId')
                    const end = tcToSec(change[3])
                    if (end) {
                        const segment = props.waveformRef.current.segments.getSegment(rowId)
                        if (segment) segment.update({endTime: end})
                        else {
                            const start = tcToSec(props.hotRef.current.getDataAtRowProp(change[0], 'start'))
                            if (start) props.waveformRef.current.segments.add(createSegment(start, end, rowId))
                        }
                    } else props.waveformRef.current.segments.removeById(rowId)
                }
            })
        })
        props.hotRef.current.addHook('afterCreateRow', (index) => {
            if (!props.fxToggle) {
                props.cellDataRef.current[index].rowId = v4()
                localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current))
            } else {
                props.fxRef.current[index].rowId = v4()
                localStorage.setItem('fx', JSON.stringify(props.fxRef.current))
            }
        })
        props.hotRef.current.addHook('beforeRemoveRow', (index, amount, physicalRows) => {
            if (props.waveformRef.current) {
                physicalRows.forEach((row) => {
                    props.waveformRef.current.segments.removeById(props.hotRef.current.getDataAtRowProp(row, 'rowId'))
                })
            }
        })
        props.hotRef.current.addHook('afterRemoveRow', () => {
            !props.fxToggle ? localStorage.setItem('subtitle', JSON.stringify(props.cellDataRef.current)) : localStorage.setItem('fx', JSON.stringify(props.fxRef.current))
        })
        props.hotRef.current.addHook('afterSelectionEnd', (row, column, row2, column2) => {
            props.hotSelectionRef.current.rowStart = Math.min(row, row2)
            props.hotSelectionRef.current.columnStart = Math.min(column, column2)
            props.hotSelectionRef.current.rowEnd = Math.max(row, row2)
            props.hotSelectionRef.current.columnEnd = Math.max(column, column2)
        })
    }, [props.size, props.hotFontSize, props.cellDataRef, props.languages, props.hotRef, props.hotSelectionRef, props.playerRef, props.fxToggle, props.fxRef, props.fxLanguages, props.waveformRef, props.isFromTimelineWindowRef])

    return <div ref={containerMain}/>
}

export default LanguageWindow
