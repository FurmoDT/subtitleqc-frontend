import {useState} from "react";
import {MDBBtn, MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane} from "mdb-react-ui-kit";
import {secToTc, tcToSec} from "../../../utils/functions";

const InformationWindow = (props) => {
    const [fillActive, setFillActive] = useState(null);

    return <>
        <MDBTabs className='mb-3 d-flex flex-nowrap'>
            <MDBTabsItem className={'text-nowrap'}>
                <MDBTabsLink onClick={() => setFillActive('guideline')}
                             active={fillActive === 'guideline'}>가이드라인</MDBTabsLink>
            </MDBTabsItem>
        </MDBTabs>
        <MDBTabsContent className={'text-nowrap'}>
            <MDBTabsPane show={fillActive === 'guideline'}>
                <MDBBtn color={'link'} onClick={() => {
                    const oldArray = props.hotRef.current.getData(0, 0, props.hotRef.current.countRows() - 3, 1)
                    const newArray = []
                    for (let i = 1; i < oldArray.length; i++) {
                        const tcOut = tcToSec(oldArray[i - 1][1])
                        const tcIn = tcToSec(oldArray[i][0])
                        if (parseFloat((tcIn - tcOut).toFixed(3)) < 0.083) {
                            newArray.push([i - 1, 1, secToTc(tcOut - 0.042)], [i, 0, secToTc(tcIn + 0.041)])
                        }
                    }
                    props.hotRef.current.setDataAtCell(newArray)
                }}>최소 자막 간격: 0.083 맞춤</MDBBtn>
            </MDBTabsPane>
        </MDBTabsContent>
    </>
}

export default InformationWindow
