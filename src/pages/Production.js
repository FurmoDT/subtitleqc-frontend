import LanguageWindow from "../components/LanguageWindow";
import MediaWindow from "../components/MediaWindow";
import TimelineWindow from "../components/TimelineWindow";

const Production = () => {
    return <>
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
