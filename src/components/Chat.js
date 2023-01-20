import React, { useState, useEffect, useRef } from 'react';
import { Avatar, IconButton } from '@mui/material';
import { AttachFile, InsertEmoticon, MoreVert, SearchOutlined, DeleteOutline } from '@mui/icons-material';
import '../styles/Chat.css';
import { useStateValue } from '../ContextApi/StateProvider'
import firebase from 'firebase/compat/app';
import { useParams } from 'react-router-dom';
import Pusher from 'pusher-js'
import { db } from './firebase';


const Chat = () => {
    const [seed, setSeed] = useState("");
    const [input, setInput] = useState('');
    const [{ user }] = useStateValue();
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const messageRef = useRef();
    // const [updatedAt, setUpdatedAt] = useState("");
    const [messages, setMessages] = useState([]);

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
        <div className="chat">
            <div className="chat__header">
                <Avatar
                    className='chat__avatar'
                    src={`https://avatars.dicebear.com/v2/avataaars/${seed}.svg`}
                />
                <div className="chat__headerInfo">
                    <h3>{roomName ? roomName : "Welcome to Messenger"}</h3>
                    <p>
                        {messages[messages.length - 1] ? `Last Seen at ${new Date(messages[messages.length - 1]?.data.timestamp?.toDate()).toString().slice(0, 25)}`
                            : "send new messages"}
                    </p>
                </div>
                <div className="chat__headerright">
                    <IconButton>
                        <SearchOutlined />
                    </IconButton>
                    <IconButton>
                        <AttachFile />
                    </IconButton>
                    <IconButton>
                        <MoreVert />
                    </IconButton>
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
                                {new Date(message?.data.timestamp?.toDate()).toString().slice(3, 25)}
                            </span>
                        </p>
                    ))
                }

            </div>
            {roomName && <div className="chat__footer">
                <InsertEmoticon />
                <form >
                    <input
                        placeholder='Type a message'
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                    />
                    <button onClick={sendMessage}>Send</button>

                </form>
            </div>}
        </div>

    )
}

export default Chat;