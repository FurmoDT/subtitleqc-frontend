import LanguageWindow from "../components/production/LanguageWindow";
import MediaWindow from "../components/production/MediaWindow";
import TimelineWindow from "../components/production/TimelineWindow";
import MenuToolbar from "../components/production/MenuToolbar";
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
            <div style={{flexDirection: "row", display: 'flex', padding: '20px'}}>
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
        </div>
    </>
};

export default Production
