import {Menu, MenuItem, Sidebar, sidebarClasses} from 'react-pro-sidebar';
import {MdDashboard, MdFolderOpen} from "react-icons/md";
import DashboardPanel from "./components/DashboardPanel";
import {Link} from "react-router-dom";
import TasksPanel from "./components/TasksPanel";
import {useState} from "react";

const MainPage = () => {
    const pathname = window.location.pathname
    const [activeMenu, setActiveMenu] = useState(pathname)

    return <div style={{height: 'calc(100vh - 50px)', display: 'flex', fontFamily: 'Nanum Gothic'}}>
        <Sidebar collapsedWidth={'50px'} collapsed={true} rootStyles={{
            [`.${sidebarClasses.container}`]: {
                backgroundColor: '#121212ff', height: 'calc(100vh - 50px)'
            },
        }}>
            <Menu style={{display: 'flex', justifyContent: 'center'}} menuItemStyles={{
                button: ({active}) => ({backgroundColor: active ? '#eecef9' : undefined})
            }}>
                <MenuItem disabled={true}/>
                <MenuItem active={activeMenu === '/'} onClick={() => setActiveMenu('/')}
                          component={<Link to={'/'}/>}>
                    <MdDashboard size={25} color={'white'}/>
                </MenuItem>
                <MenuItem active={activeMenu === '/tasks'} onClick={() => setActiveMenu('/tasks')}
                          component={<Link to={'/tasks'}/>}>
                    <MdFolderOpen size={25} color={'white'}/>
                </MenuItem>
            </Menu>
        </Sidebar>
        {pathname === '/' ? <DashboardPanel/> : pathname === '/tasks' ? <TasksPanel/> : null}
    </div>
};

export default MainPage
