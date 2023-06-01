import {useState} from "react";
import {MDBTabs, MDBTabsContent, MDBTabsItem, MDBTabsLink, MDBTabsPane} from "mdb-react-ui-kit";

const InformationWindow = () => {
    const [fillActive, setFillActive] = useState('tab1');
    const handleFillClick = (value) => {
        if (value === fillActive) {
            return;
        }

        setFillActive(value);
    };

    return <>
        <MDBTabs className='mb-3'>
            <MDBTabsItem>
                <MDBTabsLink onClick={() => handleFillClick('tab1')} active={fillActive === 'tab1'}>전달사항</MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
                <MDBTabsLink onClick={() => handleFillClick('tab2')} active={fillActive === 'tab2'}>사전</MDBTabsLink>
            </MDBTabsItem>
            <MDBTabsItem>
                <MDBTabsLink onClick={() => handleFillClick('tab3')} active={fillActive === 'tab3'}>가이드라인</MDBTabsLink>
            </MDBTabsItem>
        </MDBTabs>

        <MDBTabsContent>
            <MDBTabsPane show={fillActive === 'tab1'}>Tab 1 content</MDBTabsPane>
            <MDBTabsPane show={fillActive === 'tab2'}>Tab 2 content</MDBTabsPane>
            <MDBTabsPane show={fillActive === 'tab3'}>Tab 3 content</MDBTabsPane>
        </MDBTabsContent>
    </>
}

export default InformationWindow
