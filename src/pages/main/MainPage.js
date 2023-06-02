import {Menu, MenuItem, Sidebar, sidebarClasses} from 'react-pro-sidebar';
import {MdDashboard, MdFolderOpen} from "react-icons/md";
import DashboardPanel from "./components/DashboardPanel";
import {useNavigate} from "react-router-dom";
import ProjectsPanel from "./components/ProjectsPanel";

const MainPage = () => {
    const navigate = useNavigate()
    const pathname = window.location.pathname
    return <div style={{height: '100%', display: 'flex'}}>
        <Sidebar collapsed={true} rootStyles={{
            [`.${sidebarClasses.container}`]: {
                backgroundColor: '#121212ff', height: 'calc(100vh - 50px)'
            },
        }}>
            <Menu>
                <MenuItem disabled={true}/>
                <MenuItem style={{textAlign: 'center'}}>
                    <MdDashboard size={30} color={'white'} onClick={() => navigate('/')}/>
                </MenuItem>
                <MenuItem style={{textAlign: 'center'}}>
                    <MdFolderOpen size={30} color={'white'} onClick={() => navigate('/projects')}/>
                </MenuItem>
            </Menu>
        </Sidebar>
        {pathname === '/' ? <DashboardPanel/> : pathname === '/projects' ? <ProjectsPanel/> : null}
    </div>
};

export default MainPage
