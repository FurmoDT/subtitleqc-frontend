import {MDBBtn, MDBIcon, MDBInput, MDBPopover, MDBPopoverBody, MDBPopoverHeader,} from 'mdb-react-ui-kit';
import {useCallback, useEffect, useRef, useState} from "react";
import {MdFindReplace} from "react-icons/md";

const ReplacePopover = (props) => {
    const findPositionLabelRef = useRef(null)
    const findLabelRef = useRef(null)
    const replaceLabelRef = useRef(null)
    const [curFindPosition, setCurFindPosition] = useState(0)
    const [searched, setSearched] = useState([])
    const afterRenderPromise = props.afterRenderPromise
    const handleOnChange = useCallback((event) => {
        const result = []
        if (event.target.value) {
            props.hotRef.current.getData().forEach((row, rowIndex) => {
                row.forEach((value, colIndex) => {
                    if (value?.toLowerCase().includes(event.target.value.toLowerCase())) {
                        result.push({row: rowIndex, col: colIndex, value: event.target.value})
                    }
                })
            })
        } else props.hotRef.current.render()
        setCurFindPosition(result.length ? 1 : 0)
        setSearched(result)
    }, [props.hotRef])
    const handleOnClick = useCallback((event) => {
        if (event.target.className.includes('left') || (event.shiftKey && event.key === 'Enter')) {
            if (curFindPosition <= 1 || curFindPosition > searched.length) setCurFindPosition(searched.length)
            else setCurFindPosition(curFindPosition - 1)
        } else if (event.target.className.includes('right') || event.key === 'Enter') {
            if (curFindPosition >= searched.length) setCurFindPosition(searched.length ? 1 : 0)
            else setCurFindPosition(curFindPosition + 1)
        }
    }, [searched, curFindPosition])
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Enter') handleOnClick(event)
    }, [handleOnClick])
    useEffect(() => {
        const row = searched[curFindPosition - 1]?.row
        const col = searched[curFindPosition - 1]?.col
        if ((row || row === 0) && (col || col === 0)) {
            props.hotRef.current.scrollViewportTo(row, col)
            props.hotRef.current.render()
            afterRenderPromise().then(() => {
                const tdElement = props.hotRef.current.getCell(row, col)
                if (tdElement) tdElement.style.backgroundColor = 'yellow'
            })
        }
    }, [props.hotRef, searched, curFindPosition, afterRenderPromise])
    useEffect(() => {
        props.replaceButtonRef.current = document.getElementById('replace-popover')
    }, [props.replaceButtonRef])
    const escHandler = useCallback((event) => {
        if (event.key === 'Escape') {
            props.replaceButtonRef.current.click()
            props.hotRef.current.render()
        }
    }, [props.replaceButtonRef, props.hotRef])
    return <>
        <MDBPopover id={'replace-popover'} size={'sm'} color={'link'} placement={'right-end'}
                    btnChildren={<MdFindReplace color={'black'} size={20}/>} onShow={() => {
            const observer = new MutationObserver(() => {
                const popover = document.querySelector('.popover')
                if (popover) {
                    popover.querySelector('input').focus()
                    props.hotRef.current.unlisten()
                    observer.disconnect();
                }
            })
            observer.observe(document.body, {childList: true, subtree: true})
            document.body.addEventListener('keydown', escHandler)
        }} onHide={() => {
            document.body.removeEventListener('keydown', escHandler)
            setCurFindPosition(0)
            setSearched([])
        }}>
            <MDBPopoverHeader>Replace</MDBPopoverHeader>
            <MDBPopoverBody>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                        <MDBInput ref={findLabelRef} onChange={handleOnChange} onKeyDown={handleKeyDown} type={'text'}/>
                        <MDBInput ref={replaceLabelRef} type={'text'}/>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'end', marginLeft: '5px'}}>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                            <label style={{display: 'flex', alignItems: 'center'}}
                                   ref={findPositionLabelRef}>{curFindPosition}/{searched.length}</label>
                            <MDBBtn size={'sm'} color={'link'} floating tag='a' onClick={handleOnClick}>
                                <MDBIcon fas icon="chevron-left" color={'dark'}/>
                            </MDBBtn>
                            <MDBBtn size={'sm'} color={'link'} floating tag='a' onClick={handleOnClick}>
                                <MDBIcon fas icon="chevron-right" color={'dark'}/>
                            </MDBBtn>
                        </div>
                        <MDBBtn color={'secondary'} onClick={() => {
                            if (replaceLabelRef.current.value) {
                                const row = searched[curFindPosition - 1]?.row
                                const col = searched[curFindPosition - 1]?.col
                                props.hotRef.current.setDataAtCell(row, col, props.hotRef.current.getDataAtCell(row, col).replace(findLabelRef.current.value, replaceLabelRef.current.value))
                            }
                        }}>replace</MDBBtn>
                    </div>
                </div>
            </MDBPopoverBody>
        </MDBPopover>
    </>
}

export default ReplacePopover
