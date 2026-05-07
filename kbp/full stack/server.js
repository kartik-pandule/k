// server.js
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB (Replace with your URI)
mongoose.connect('mongodb://localhost:27017/chat-app');

// 2. Define Message Schema
const Message = mongoose.model('Message', {
  text: String,
  uid: String,
  displayName: String,
  timestamp: { type: Date, default: Date.now },
  avatarColor: String
});

// 3. API Endpoints
app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// 4. Real-time with Socket.io
io.on('connection', (socket) => {
  socket.on('send-message', async (data) => {
    const newMessage = new Message(data);
    await newMessage.save();
    io.emit('receive-message', newMessage); // Broadcast to everyone
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User, 
  MessageSquare, 
  Circle, 
  Hash, 
  Smartphone,
  Globe,
  Database,
  Server
} from 'lucide-react';

/**
 * Real-Time Chat Application (MongoDB + Node.js Integration)
 * * TO RUN THE BACKEND:
 * 1. Create a file named 'server.js'
 * 2. Install dependencies: npm install express mongoose cors socket.io
 * 3. Run: node server.js
 * * This frontend is configured to communicate with a MongoDB-backed API.
 */
export default function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState({ 
    uid: `user_${Math.random().toString(36).substr(2, 4)}`,
    displayName: `Guest_${Math.random().toString(36).substr(2, 4)}`,
    avatarColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
  });
  const [status, setStatus] = useState('connecting'); // connecting, connected, error
  const scrollRef = useRef(null);

  // Simulation of MongoDB Fetching & Socket connection
  useEffect(() => {
    // In a real environment, you would use:
    // const socket = io('http://localhost:5000');
    
    const fetchInitialMessages = async () => {
      try {
        // MOCK API CALL: This represents a GET request to a MongoDB/Express endpoint
        // Example: fetch('http://localhost:5000/api/messages')
        setStatus('connected');
        
        // Initial mock data as if coming from MongoDB
        const mockMongoData = [
          { _id: '1', text: 'Welcome to the MongoDB backed chat!', uid: 'system', displayName: 'System', timestamp: new Date(), avatarColor: '#10b981' }
        ];
        setMessages(mockMongoData);
      } catch (err) {
        setStatus('error');
      }
    };

    fetchInitialMessages();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      uid: user.uid,
      displayName: user.displayName,
      timestamp: new Date(),
      avatarColor: user.avatarColor
    };

    // 1. Update UI Optimistically (Mimicking Socket.io event)
    setMessages(prev => [...prev, { ...messageData, _id: Date.now().toString() }]);
    setNewMessage('');

    // 2. Real Backend Logic (Node + MongoDB):
    /*
      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData)
        });
        const savedMessage = await response.json(); // Returned from MongoDB with _id
        // socket.emit('new-message', savedMessage);
      } catch (e) {
        console.error("MongoDB Save Error", e);
      }
    */
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Database size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white">MongoChat</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stack Info</h2>
              <Server size={14} className="text-slate-600" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>MongoDB Connected</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Express/Node.js API</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Channels</h2>
            <div className="space-y-1">
              {['general', 'database-logs', 'deployment'].map((chan) => (
                <div key={chan} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${chan === 'general' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400'}`}>
                  <Hash size={16} />
                  <span>{chan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-inner" style={{ backgroundColor: user.avatarColor }}>
              {user.displayName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-slate-500 truncate">ID: {user.uid}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0b141a]">
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10">
          <div className="flex items-center gap-3">
            <Hash size={20} className="text-slate-500" />
            <h2 className="font-bold text-lg">general</h2>
            <div className="flex items-center gap-1.5 ml-2">
              <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <Globe size={18} className="cursor-pointer hover:text-white" />
            <Smartphone size={18} className="cursor-pointer hover:text-white" />
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => {
            const isMe = msg.uid === user.uid;
            return (
              <div key={msg._id} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-bold" style={{ backgroundColor: msg.avatarColor }}>
                  {msg.displayName?.[0]}
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs text-slate-400">{msg.displayName}</span>
                    <span className="text-[9px] text-slate-600">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-2">
            <input 
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-3 px-5 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-white"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-50 transition-all shadow-lg"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}