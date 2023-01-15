import InformationWindow from "../components/production/InformationWindow";
import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import MenuToolbar from "../components/production/MenuToolbar";
import TimelineWindow from "../components/production/TimelineWindow";
import {useEffect, useRef} from "react";
import {setDropzone} from "../utils/setDropzone";

const Production = () => {
    const dropzone = useRef(null)
    useEffect(() => {
        setDropzone(dropzone.current)
    }, [dropzone])
    return <>
        <MenuToolbar/>
        <div ref={dropzone}>
            <div style={{flexDirection: "row", display: 'flex', justifyContent: 'center', padding: '20px'}}>
                <div style={{display: 'flex', justifyContent: 'center'}}>
                    <div style={{flexDirection: 'column', display: 'flex'}}>
                        <MediaWindow/>
                        <InformationWindow/>
                    </div>
                    <div style={{flexDirection: 'column', display: 'flex'}}>
                        <LanguageWindow/>
                        <TimelineWindow/>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default Production
