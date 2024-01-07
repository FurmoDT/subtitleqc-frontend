import {useState} from "react";
import {MDBBtn, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane} from "mdb-react-ui-kit";
import {secToTc, tcToSec} from "../../../utils/functions";

const InformationWindow = (props) => {
    const [fillActive, setFillActive] = useState(null);

    return <div className={'d-flex flex-column h-100'}>
        <MDBTabs className='mb-3 d-flex flex-nowrap'>
            <MDBTabsItem className={'text-nowrap'}>
                <MDBTabsLink onClick={() => setFillActive('guideline')}
                             active={fillActive === 'guideline'}>가이드라인</MDBTabsLink>
            </MDBTabsItem>
        </MDBTabs>
        <MDBTabsContent className={'d-flex text-nowrap flex-grow-1 overflow-auto'}>
            <MDBTabsPane show={fillActive === 'guideline'}>
                <div className={'mx-2'}>최소 노출 시간: {props.projectDetail.guideline.tcRange?.min}</div>
                <div className={'mx-2'}>최대 노출 시간: {props.projectDetail.guideline.tcRange?.max}</div>
                <div className={'mx-2 my-3'}>최소 자막 간격: {props.projectDetail.guideline.tcInterval?.value}
                    <MDBBtn color={'link'} size={'sm'} onClick={() => {
                        const oldArray = props.hotRef.current.getData(0, 0, props.hotRef.current.countRows() - 3, 1)
                        const newArray = []
                        for (let i = 1; i < oldArray.length; i++) {
                            const tcOut = tcToSec(oldArray[i - 1][1])
                            const tcIn = tcToSec(oldArray[i][0])
                            const interval = parseFloat((tcIn - tcOut).toFixed(3))
                            if (interval < props.projectDetail.guideline.tcInterval.value) {
                                const diff = parseFloat(((props.projectDetail.guideline.tcInterval.value - interval) / 2).toFixed(4))
                                newArray.push([i - 1, 1, secToTc(tcOut - parseFloat((diff - 0.0001).toFixed(3)))], [i, 0, secToTc(tcIn + parseFloat((diff + 0.00049).toFixed(3)))])
                            }
                        }
                        props.hotRef.current.setDataAtCell(newArray)
                    }}>맞춤</MDBBtn>
                </div>
            </MDBTabsPane>
        </MDBTabsContent>
    </div>
}

export default InformationWindow
