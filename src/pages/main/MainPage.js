import {Menu, MenuItem, Sidebar, sidebarClasses} from 'react-pro-sidebar';
import {MdDashboard, MdFolderOpen} from "react-icons/md";
import DashboardPanel from "./components/DashboardPanel";
import {Link, useNavigate} from "react-router-dom";
import TaskPanel from "./components/TaskPanel";
import {useContext, useEffect, useState} from "react";
import ProjectPanel from "./components/ProjectPanel";
import {BsListTask} from "react-icons/bs";
import {AuthContext} from "../../contexts/authContext";
import "../../css/ReactDataGrid.css";
import "./MainPage.css";

const MainPage = () => {
    const pathname = window.location.pathname
    const [activeMenu, setActiveMenu] = useState(null)
    const navigate = useNavigate()
    const {userRef} = useContext(AuthContext)

    useEffect(() => {
        if (pathname === '/') navigate('/tasks') // before dashboard
        setActiveMenu(pathname)
    }, [navigate, pathname])

    return <div className={'d-flex'} style={{height: 'calc(100vh - 50px)'}}>
        <Sidebar collapsedWidth={'4rem'} collapsed={true} rootStyles={{
            [`.${sidebarClasses.container}`]: {backgroundColor: '#ecf1fb'},
        }}>
            <Menu className={'d-flex justify-content-center'} menuItemStyles={{
                button: ({active}) => ({
                    backgroundColor: active ? '#c4d1e9' : undefined,
                    '&:hover': {backgroundColor: '#d8e1f5'}
                })
            }}>
                <MenuItem className={'my-3'} active={activeMenu === '/'} onClick={() => setActiveMenu('/')}
                          component={<Link to={'/'}/>} disabled>
                    <MdDashboard size={25} color={'#6cadd0'}/>
                </MenuItem>
                <MenuItem className={'mb-3'} active={activeMenu === '/tasks'} onClick={() => setActiveMenu('/tasks')}
                          component={<Link to={'/tasks'}/>}>
                    <BsListTask size={25} color={'#6cadd0'}/>
                </MenuItem>
                {/^(admin|pm)$/.test(userRef.current.userRole) &&
                    <MenuItem className={'mb-3'} active={activeMenu === '/projects'}
                              onClick={() => setActiveMenu('/projects')}
                              component={<Link to={'/projects'}/>}>
                        <MdFolderOpen size={25} color={'#6cadd0'}/>
                    </MenuItem>}
            </Menu>
        </Sidebar>
        {pathname === '/' ? <DashboardPanel/> : pathname === '/tasks' ? <TaskPanel/> : pathname === '/projects' ?
            <ProjectPanel/> : null}
    </div>
};

export default MainPage
