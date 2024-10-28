import React, { useEffect, useRef, useState } from 'react';
import { doc, getDoc, updateDoc, onSnapshot} from 'firebase/firestore';
import db from '../firebase.config';
import { useSelector } from 'react-redux';
import '../style.css/messaging.css'; // Include the CSS file for styling
import { uploadImage } from '../action'; // Ensure this function is implemented correctly

const Messaging = () => {
    const [connections, setConnections] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatMessage, setChatMessage] = useState('');
    const [secondPerson, setSecondPerson] = useState({});
    const currentUser = useSelector((state) => state.userState.user);
    const messagesListRef = useRef(null); // Create a ref for the messages list


    // Function to fetch user details based on email
    const fetchUserDetails = async (emails) => {
        const userDetails = [];
        for (const email of emails) {
            const userRef = doc(db, 'profiles', email);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                userDetails.push({ ...userSnap.data(), email });
            }
        }
        return userDetails;
    };

    useEffect(() => {
        // Fetch followers and following details based on emails
        const loadConnections = async () => {
            const followers = currentUser.connection?.followers || [];
            const following = currentUser.connection?.following || [];
            const uniqueEmails = [...new Set([...followers, ...following])];
            const allConnections = await fetchUserDetails(uniqueEmails);
            setConnections(allConnections);
        };

        if (currentUser) {
            loadConnections();
        }
    }, [currentUser]); // Added currentUser as a dependency

    useEffect(() => {
        if (messagesListRef.current) {
            messagesListRef.current.scrollTop = messagesListRef.current.scrollHeight;
        }
    }, [messages]); // This effect runs whenever messages change

    useEffect(() => {
        let unsubscribe;
        if (selectedChat) {
            const profileRef = doc(db, 'profiles', currentUser.email);
            unsubscribe = onSnapshot(
                profileRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const chats = data.chats;
                        if (chats && chats[selectedChat]) {
                            const senderMessages = chats[selectedChat].messages || [];
                            setMessages((prevMessages) => {
                                // Filter out any duplicate messages already in the state
                                const newMessages = senderMessages.filter(
                                    (msg) => !prevMessages.some(
                                        (prevMsg) => prevMsg?.timestamp?.seconds === msg?.timestamp?.seconds && prevMsg.content === msg.content
                                    )
                                );
                                // Merge new messages with previous messages and sort
                                const allMessages = [...prevMessages, ...newMessages];
                                return allMessages.sort((a, b) => new Date(a.timestamp?.seconds || a.timestamp).getTime() - new Date(b.timestamp?.seconds || b.timestamp).getTime());
                            });
                        }
                    }
                },
                (error) => {
                    console.error('Error retrieving profile document:', error);
                }
            );
    
            // Second listener for the selected chat's profile
            const receiverProfileRef = doc(db, 'profiles', selectedChat);
            unsubscribe = onSnapshot(
                receiverProfileRef,
                (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        const chats = data.chats;
                        if (chats && chats[currentUser.email]) {
                            const receiverMessages = chats[currentUser.email].messages || [];
                            setMessages((prevMessages ) => {
                                // Filter out any duplicate messages already in the state
                                const newMessages = receiverMessages.filter(
                                    (msg) => !prevMessages.some(
                                        (prevMsg) => prevMsg?.timestamp?.seconds === msg?.timestamp?.seconds && prevMsg.content === msg.content
                                    )
                                );
                                // Merge new messages with previous messages and sort
                                const allMessages = [...prevMessages, ...newMessages];
                                return allMessages.sort((a, b) => new Date(a.timestamp?.seconds || a.timestamp).getTime() - new Date(b.timestamp?.seconds || b.timestamp).getTime());
                            });
                        }
                    }
                },
                (error) => {
                    console.error('Error retrieving receiver profile document:', error);
                }
            );
        }
        return unsubscribe;
    }, [selectedChat, currentUser]);
    
    
    

    const handleOpenChat = async (email, secondPersonDetails) => {
        setSecondPerson(secondPersonDetails);
        setSelectedChat(email);
    };

    // Rest of your code...
    
    const handleSendMessage = async () => {
        if (!chatMessage.trim()) return; // Don't send empty messages
    
        const chatKey = selectedChat; // Key for the chat (e.g., recipient's email)
        const userRef = doc(db, 'profiles', currentUser.email);
        const receiverRef = doc(db, 'profiles', chatKey);
    
        const newMessage = {
            sender: currentUser.email,
            receiver: chatKey,
            content: chatMessage,
            timestamp: new Date(),
        };
    
        try {
            // Update the sender's chat
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const chats = userDoc.data().chats || {};
                if (!chats[chatKey]) {
                    chats[chatKey] = { messages: [] };
                }
                chats[chatKey].messages.push(newMessage);
                await updateDoc(userRef, { chats });
            }
    
            // Update the receiver's chat
            const receiverDoc = await getDoc(receiverRef);
            if (receiverDoc.exists()) {
                const receiverChats = receiverDoc.data().chats || {};
                if (!receiverChats[currentUser.email]) {
                    receiverChats[currentUser.email] = { messages: [] };
                }
                receiverChats[currentUser.email].messages.push(newMessage);
                await updateDoc(receiverRef, { chats: receiverChats });
            }
    
            setChatMessage(''); // Clear the input after sending
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };
    
    
      
    const handleSendImage = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        // Upload image to a cloud storage and get the URL
        const imageUrl = await uploadImage(file); // Implement this function to handle image upload
    
        const userRef = doc(db, 'profiles', currentUser.email);
        const newMessage = {
            sender: currentUser.email,
            receiver: selectedChat,
            content: imageUrl,
            timestamp: new Date(),
        };
    
        try {
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const chats = userDoc.data().chats || {};
    
                // Ensure chat entry exists
                if (!chats[selectedChat]) {
                    chats[selectedChat] = { messages: [] };
                }
    
                chats[selectedChat].messages.push(newMessage); // Append new message
                await updateDoc(userRef, { chats });
    
                // No need to update the state manually here
                setChatMessage(''); // Clear input after sending
            }
        } catch (error) {
            console.error('Error sending image:', error);
        }
    };
    

    const formattedTimestamp =  (time)=>{
       return new Date(time).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
   function getLastChatMessage(currentUserEmail, connection) { 
  if (!connection.chats || !connection.chats[currentUserEmail]) {
    return null; // No chats found for the current user
  }

  const messages = connection.chats[currentUserEmail].messages;
  if (!messages || messages.length === 0) {
    return null; // No messages found for the current user
  }

  const lastMessage = messages[messages.length - 1];
  const sender = lastMessage.sender; 

  if (sender === currentUserEmail) {
    return lastMessage.content; // Display the last message content
  } else if (sender === connection.email) {
    if (lastMessage.content.includes('http')) {
      return 'sent an image'; // Display 'sent an image' if the content includes a URL
    } else {
      return 'sent a message'; // Display 'sent a message' if the content is a text
    }
  } 

  return null; // Unknown sender
}
    return (
        <div className="messaging-container">
            {!selectedChat ? (
                <div className="connections-list">
                    <h4>Your Connections</h4>
                    <div className="connections-row mt-2">
                        {connections.map((connection) => (
                            <div
                                key={connection.email}
                                className="connection-card"
                                onClick={() => handleOpenChat(connection.email, connection)}
                            >
                                <img
                                    src={connection.image || '/images/default-avatar.png'}
                                    alt={connection.name}
                                />
                                <div className='mx-2 p-1'>
                                    <p className='fw-semibold'>{connection.name}</p>
                                    <p className='small'>{getLastChatMessage(currentUser.email , connection) ?? 'messages'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="chat-interface shadow-lg">
                    <button className="back-button float-right" onClick={() => setSelectedChat(null)}>
                        <i className='bi bi-arrow-left'></i>
                    </button>
                    <div className='d-flex'>
                        <a href={`/profile/${secondPerson.email}`}>
                            <img height={'50px'} className='rounded' src={secondPerson?.image || '/images/user.svg'} alt='' />
                        </a>
                        <span>
                            <p className='mx-2 fw-semibold'>{secondPerson?.name || 'Unnamed User'}</p>
                            <p className='small mx-2'>{secondPerson?.headline || 'Unnamed User'}</p>
                        </span>
 </div>
                    <div className="messages-list mt-2" ref={messagesListRef}>
                            {messages?.length > 0 && messages.map((message, index) => (
                                <div
                                key={index}
                                className={`message ${message.sender === currentUser.email ? 'sent' : 'received' } `}
                                >
                                {message?.content?.includes('http') ? (
                                    <img height={"200px"} src={message.content} alt="sent" className="message-image" />
                                ) : (
                                    <p>{message.content}</p>
                                )}
                                <p className='small'>{message?.timestamp?.seconds && formattedTimestamp(message?.timestamp?.seconds * 1000)}{message.sender === currentUser.email ? ' sent' : ' received'}</p>
                                
                                </div>
                            ))}
                        </div>
                    <div className="send-message col">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSendImage}
                            style={{ display: 'none' }}
                            id="image-upload"
                            className='col-md-1'
                        />
                        <label htmlFor="image-upload" className="btn btn-lg border-0 my-auto p-0 mx-2">
                            <i className='bi bi-image col-md-1'></i>
                        </label>
                        <input
                        className='col-md-10'
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Messaging;