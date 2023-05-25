const AdminPanel = ({userListRef}) => {
    return <div>{userListRef.current.map(v=><p key={v.user_email}>{JSON.stringify(v)}</p>)}</div>
}

export default AdminPanel
