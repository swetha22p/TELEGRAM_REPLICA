import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Fuse from 'fuse.js';
import '../App.css';

function Chatscreen() {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    axios.get('https://devapi.beyondchats.com/api/get_all_chats?page=1')
      .then(response => {
        setChats(response.data.data.data);
        setFilteredChats(response.data.data.data);
        setLoadingChats(false);
      })
      .catch(error => {
        console.error('There was an error fetching the chats!', error);
        setLoadingChats(false);
      });
  }, []);

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
    setLoadingMessages(true);
    axios.get(`https://devapi.beyondchats.com/api/get_chat_messages?chat_id=${chat.id}`)
      .then(response => {
        setMessages(response.data.data);
        setLoadingMessages(false);
      })
      .catch(error => {
        console.error('There was an error fetching the messages!', error);
        setLoadingMessages(false);
      });
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const fuse = new Fuse(chats, {
        keys: ['creator.name', 'creator.email', 'creator.phone'],
        threshold: 0.3,
      });
      const results = fuse.search(searchQuery).map(result => result.item);
      setFilteredChats(results);
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats]);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="chat-list">
          {loadingChats ? (
            <p>Loading...</p>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                className="chat-item"
                onClick={() => handleChatClick(chat)}
              >
                <div className="chat-header">
                  <h2>{chat.creator.name}</h2>
                  <p>{new Date(chat.created_at).toLocaleTimeString()}</p>
                </div>
                <p>{chat.status === 'ongoing' ? 'Online' : 'Offline'}</p>
                <p>{chat.msg_count} messages</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="main-content">
        {selectedChat ? (
          <div className="chat-messages">
            <h2>Chat with {selectedChat.creator.name}</h2>
            {loadingMessages ? (
              <p>Loading messages...</p>
            ) : (
              messages.map(message => (
                <div key={message.id} className="message">
                  <p><strong>{message.sender.name}:</strong> {message.message}</p>
                  <p>{new Date(message.created_at).toLocaleTimeString()}</p>
                </div>
              ))
            )}
          </div>
        ) : (
          <p>Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
}

export default Chatscreen;
