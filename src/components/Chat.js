import React, { useState, useEffect, useRef } from 'react';
import { Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { AttachFile, InsertEmoticon, MoreVert, SearchOutlined, DeleteOutline, Menu as MenuIcon, ArrowBack, KeyboardArrowDown } from '@mui/icons-material';
import '../styles/Chat.css';
import { useStateValue } from '../ContextApi/StateProvider'
import firebase from 'firebase/compat/app';
import { useParams } from 'react-router-dom';
import Pusher from 'pusher-js'
import { db } from './firebase';


const Chat = ({ toggleSidebar, isSidebarOpen }) => {
    const [seed, setSeed] = useState("");
    const [input, setInput] = useState('');
    const [{ user }] = useStateValue();
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const messageRef = useRef();
    // const [updatedAt, setUpdatedAt] = useState("");
    const [messages, setMessages] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMsgId, setSelectedMsgId] = useState(null);

    const handleMenuClick = (event, msgId) => {
        setAnchorEl(event.currentTarget);
        setSelectedMsgId(msgId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedMsgId(null);
    };

    const handleDeleteMsg = () => {
        if(selectedMsgId) deleteMessage(selectedMsgId);
        handleMenuClose();
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input) {
            return;
        }
        db.collection("rooms")
            .doc(roomId)
            .collection('messages')
            .add({
                message: input,
                name: user.displayName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            })
        setInput('');

    }
    const handleDelete = async (e) => {
        e.preventDefault();
        await db.collection('rooms').doc(roomId).delete()
    }

    const deleteMessage = async (msgid) => {
        await db.collection("rooms")
            .doc(roomId)
            .collection("messages")
            .doc(msgid)
            .delete()
            .catch((err) => { console.log(err) })
    }


    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView(
                {
                    behavior: 'smooth',
                    block: 'end',
                    inline: 'nearest'
                })
        }
    },
        [messages])

    useEffect(() => {

        const fetchData = async () => {
            if (roomId) {
                await db?.collection("rooms")
                    ?.doc(roomId)
                    ?.onSnapshot((snapshot) => {
                        setRoomName(snapshot?.data()?.name)

                    });
                await db.collection("rooms").doc(roomId)
                    .collection("messages")
                    .orderBy("timestamp", "asc")
                    .onSnapshot((snapshot) => {
                        setMessages(snapshot.docs.map(
                            doc => ({
                                id: doc.id,
                                data: doc.data(),
                            })
                        ))
                    })
            }
        }
        fetchData()

    }, [roomId])

    useEffect(() => {
        setSeed(Math.floor(Math.random() * 5000));
    }, [])

    useEffect(() => {
        const pusher = new Pusher('05e1e20b1da3e5893693', {
            cluster: 'ap2'
        });

        const channel = pusher.subscribe('messages');
        channel.bind('inserted', function (newMsg) {
            setMessages(prevMessages => [...prevMessages, newMsg])
        });
    }, [])


    return (
        <div className={`chat ${!isSidebarOpen ? "chat--fullWidth" : ""}`}>
            <div className="chat__header">
                <IconButton onClick={toggleSidebar}>
                   {isSidebarOpen ? <ArrowBack /> : <MenuIcon />}
                </IconButton>
                <Avatar
                    className='chat__avatar'
                    src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`}
                />
                <div className="chat__headerInfo">
                    <h3>{roomName ? roomName : "Welcome to Messenger"}</h3>
                    <p>
                        {messages[messages.length - 1] ? `Last Seen ${new Date(messages[messages.length - 1]?.data.timestamp?.toDate()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}`
                            : "send new messages"}
                    </p>
                </div>
                <div className="chat__headerright">
                    {/* <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton> */}
                    <IconButton>
                        < DeleteOutline onClick={handleDelete} />
                    </IconButton>
                </div>
            </div>
            <div className="chat__body">
                {
                    messages.map((message) => (
                        <p
                            className={`chat__message ${message.data.name === user.displayName && 'chat__receiver'}`}
                            key={message.id}
                            onDoubleClick={() => { deleteMessage(message.id) }}
                            ref={messageRef}
                        >
                            <span className='chat__name'> {message.data.name}</span>
                            {message.data.message}
                            <span className='chat__timestamp'>
                                
                                {new Date(message?.data.timestamp?.toDate()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                            <div className="chat__messageActions">
                                <IconButton 
                                    size="small" 
                                    onClick={(e) => handleMenuClick(e, message.id)}
                                    className="chat__messageDropdown"
                                >
                                    <KeyboardArrowDown fontSize="small" />
                                </IconButton>
                            </div>
                        </p>
                    ))
                }
                <Menu
                    id="message-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <MenuItem onClick={handleDeleteMsg}>
                        <DeleteOutline fontSize="small" style={{ marginRight: '10px' }} /> Delete
                    </MenuItem>
                </Menu>

            </div>
            {roomName && <div className="chat__footer">
                {/* <InsertEmoticon /> */}
                <form >
                    <input
                        placeholder='Type a message'
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                    />
                    <button style={{ borderRadius:"5px", padding:"10px",margin:"0px 10px",backgroundColor: "#1a75ff", color: "white",outline:"none",border:"none",cursor:"pointer" ,fontSize:"14px" }} onClick={sendMessage}>🚀</button>

                </form>
            </div>}
        </div>

    )
}

export default Chat;