import React, { useEffect, useState } from 'react'
import '../styles/SidebarChat.css'
import { Avatar, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { db } from './firebase'


const SidebarChat = ({ addNewChat, id, name }) => {

    const [seed, setSeed] = useState("");
    const [messages, setMessages] = useState("")
    const createChat = async () => {
        const roomName = prompt("please Enter the room name");

        if (roomName) {
            db.collection("rooms").add({
                name: roomName,
            })
        }
    }
    useEffect(() => {
        if (id) {
            db.collection("rooms")
                .doc(id)
                .collection("messages")
                .orderBy("timestamp", "desc")
                .onSnapshot(snapshot => {
                    setMessages(snapshot.docs.map((doc) => doc.data()))
                })
        }
    }, [id])

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, [])

    return !addNewChat ? (
        <Link to={`/rooms/${id}`}>
            <div className="sidebarchat">
                <Avatar src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`} />
                <div className="sidebarChat__info">
                    <h2>{name}</h2>
                    <p className='sidebarchat__message'>
                        {`${(messages[0]?.message)?.slice(0, 20) || ("start new chat").slice(0, 20)}...`}
                    </p>
                </div>
            </div>
        </Link>
    ) : (
        <div className="sidebarchat" >
            <Button className='border border-white' onClick={createChat}> new Chat</Button>
        </div>
    )
}

export default SidebarChat