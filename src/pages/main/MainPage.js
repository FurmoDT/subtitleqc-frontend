import {Menu, MenuItem, Sidebar, sidebarClasses} from 'react-pro-sidebar';
import {MdDashboard, MdFolderOpen} from "react-icons/md";
import DashboardPanel from "./components/DashboardPanel";
import {Link} from "react-router-dom";
import ProjectsPanel from "./components/ProjectsPanel";

const MainPage = () => {
    const pathname = window.location.pathname
    return <div style={{height: '100%', display: 'flex'}}>
        <Sidebar collapsedWidth={'50px'} collapsed={true} rootStyles={{
            [`.${sidebarClasses.container}`]: {
                backgroundColor: '#121212ff', height: 'calc(100vh - 50px)'
            },
        }}>
            <Menu style={{display: 'flex', justifyContent: 'center'}}>
                <MenuItem disabled={true}/>
                <MenuItem component={<Link to={'/'}/>}>
                    <MdDashboard size={25} color={'white'}/>
                </MenuItem>
                <MenuItem component={<Link to={'/projects'}/>}>
                    <MdFolderOpen size={25} color={'white'}/>
                </MenuItem>
            </Menu>
        </Sidebar>
        {pathname === '/' ? <DashboardPanel/> : pathname === '/projects' ? <ProjectsPanel/> : null}
    </div>
};

export default MainPage
