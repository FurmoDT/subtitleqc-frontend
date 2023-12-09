import {MDBBtn, MDBIcon, MDBInput, MDBPopover, MDBPopoverBody, MDBPopoverHeader, MDBTooltip,} from 'mdb-react-ui-kit';
import {useCallback, useEffect, useRef, useState} from "react";
import {MdSearch} from "react-icons/md";

const FindPopover = (props) => {
    const findPositionLabelRef = useRef(null)
    const [curFindPosition, setCurFindPosition] = useState(0)
    const [searched, setSearched] = useState([])
    const afterRenderPromise = props.afterRenderPromise
    const handleOnChange = useCallback((event) => {
        const result = []
        if (event.target.value) {
            props.hotRef.current.getData().forEach((row, rowIndex) => {
                row.forEach((value, colIndex) => {
                    if (colIndex !== 3 && value?.toLowerCase().includes(event.target.value.toLowerCase())) {
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
        props.findButtonRef.current = document.getElementById('find-popover')
    }, [props.findButtonRef])
    const escHandler = useCallback((event) => {
        if (event.key === 'Escape') {
            props.findButtonRef.current.click()
            props.hotRef.current.render()
        }
    }, [props.findButtonRef, props.hotRef])
    return <div className={'d-inline-block'}>
        <MDBPopover id={'find-popover'} size={'sm'} color={'link'} placement={'right-end'}
                    btnClassName={'transToolbar-button'}
                    btnChildren={<MDBTooltip className={'pb-13'} tag='span' title='Find'>
                        <MdSearch color={'black'} size={20}/></MDBTooltip>} onShow={() => {
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
            <MDBPopoverHeader>
                <div className={'d-flex align-items-center justify-content-between'}>
                    Find<MDBBtn className='btn-close' color='none' onClick={() => props.findButtonRef.current.click()}/>
                </div>
            </MDBPopoverHeader>
            <MDBPopoverBody>
                <div className={'d-flex flex-row'}>
                    <MDBInput data-source={'transToolbar'} onChange={handleOnChange} onKeyDown={handleKeyDown}
                              type='text'/>
                    <div className={'d-flex flex-row align-items-center'}>
                        <span ref={findPositionLabelRef} className={'ms-2'}>{curFindPosition}/{searched.length}</span>
                        <MDBBtn data-source={'transToolbar'} size={'sm'} color={'link'} floating
                                onClick={handleOnClick}>
                            <MDBIcon fas icon="chevron-left" color={'dark'}/>
                        </MDBBtn>
                        <MDBBtn data-source={'transToolbar'} size={'sm'} color={'link'} floating
                                onClick={handleOnClick}>
                            <MDBIcon fas icon="chevron-right" color={'dark'}/>
                        </MDBBtn>
                    </div>
                </div>
            </MDBPopoverBody>
        </MDBPopover>
    </div>
}

export default FindPopover
