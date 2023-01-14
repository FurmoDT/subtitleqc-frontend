import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import TimelineWindow from "../components/production/TimelineWindow";
import MenuToolbar from "../components/production/MenuToolbar";

const Production = () => {
    return <>
        <MenuToolbar/>
        <div style={{flexDirection: "row", display: 'flex'}}>
            <div style={{display: 'flex', width: '100%', justifyContent: 'center'}}>
                <div style={{flexDirection: 'column', display: 'flex'}}>
                    <MediaWindow/>
                </div>
                <div style={{flexDirection: 'column', display: 'flex', alignItems: 'center'}}>
                    <LanguageWindow/>
                    <TimelineWindow/>
                </div>
            </div>
        </div>
    </>
};

export default Production
