import React, { useState, useEffect } from 'react'
import '../styles/Sidebar.css'
import { DonutLarge, MoreVert, Chat, SearchOutlined } from '@mui/icons-material'
import { Avatar, IconButton } from '@mui/material'
import { useStateValue } from '../ContextApi/StateProvider'
// import Pusher from 'pusher-js'
import SidebarChat from './SidebarChat'
import { db } from './firebase'


const Sidebar = () => {

    const [{ user }] = useStateValue();
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            await db.collection('rooms').onSnapshot(snapshot => (
                setRooms(snapshot.docs.map(doc => ({
                    id: doc.id,
                    data: doc.data(),
                })))
            ))

        }
        fetchData();

    }, [])

    useEffect(() => {

        const filteredResults = rooms.filter((room) =>
            ((room.data.name).toLowerCase()).includes(search.toLowerCase())
        );

        setSearchResults(filteredResults)


    }, [rooms, search])

    return (
        <div className="sidebar">
            <div className="side__header">
                <Avatar src={user.photoURL} />
                <div className="sidebar__headerRight">
                    <IconButton>
                        <DonutLarge />
                    </IconButton>
                    <IconButton>
                        <Chat />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
                </div>
            </div>
            <div className='sidebar__search'>
                <div className="sidebar__searchContainer">
                    <SearchOutlined />
                    <input
                        placeholder='Search'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className='sidebar__chats'>
                <SidebarChat addNewChat />
                {
                    searchResults.map((room) => (
                        <SidebarChat key={room.id} id={room.id} name={room.data.name} room={room} />
                    )
                    )
                }
            </div>
        </div>
    )
}

export default Sidebar