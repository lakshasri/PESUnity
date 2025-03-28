import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FileText, Download, ThumbsUp, MessageCircle, Upload } from 'lucide-react';
import MessageBubble from "@/components/MessageBubble";

const Dashboard = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    if (wsRef.current) {
      return; // Prevent multiple connections
    }

    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:5000');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      // Fetch messages only after WebSocket connection is established
      fetchMessages();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        setMessages(prev => {
          // Check if message already exists
          const exists = prev.some(msg => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user]);

  useEffect(() => {
    const handleStatsUpdate = (event) => {
      setUserStats(event.detail);
    };

    window.addEventListener('userStatsUpdate', handleStatsUpdate);

    return () => {
      window.removeEventListener('userStatsUpdate', handleStatsUpdate);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/files');
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !wsRef.current) return;

    const messageData = {
      text: newMessage,
      sender: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      }
    };

    if (wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
      setNewMessage('');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('uploadedBy', user.id);
    formData.append('title', selectedFile.name);

    try {
      const response = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      setSelectedFile(null);
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file: ' + error.message);
    }
  };

  const handleUpvote = async (fileId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/files/${fileId}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!response.ok) throw new Error('Failed to upvote file');
      
      // Refresh files to show updated upvotes
      fetchFiles();
    } catch (error) {
      console.error('Error upvoting file:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch user stats');
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-2xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your learning hub awaits.
          </p>
        </div>
        <div className="flex flex-col space-y-8">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="w-full justify-start bg-white/70 border-b border-slate-200 mb-8">
              <TabsTrigger value="files" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                Files
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Chat
              </TabsTrigger>
              <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="files">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-center">
                      <Upload className="w-12 h-12 text-gray-900" />
                    </div>
                    <h4 className="font-medium text-slate-800 text-center">Upload New File</h4>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gray-100 file:text-gray-900
                        hover:file:bg-gray-200"
                    />
                    <Button 
                      onClick={handleFileUpload}
                      disabled={!selectedFile}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Upload File
                    </Button>
                  </div>
                </div>

                {files.map((file) => (
                  <div key={file._id} className="bg-white/70 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <h4 className="font-medium text-slate-800">{file.originalName}</h4>
                          <p className="text-sm text-slate-600">
                            Uploaded by {file.uploadedBy?.firstName} {file.uploadedBy?.lastName} on{' '}
                            {format(new Date(file.uploadedAt), 'PPP')}
                          </p>
                        </div>
                        <Button 
                          variant="ghost"
                          onClick={() => handleUpvote(file._id)}
                          className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
                        >
                          <ThumbsUp className={`w-5 h-5 ${file.upvotes?.includes(user?.id) ? 'text-gray-900 fill-gray-900' : ''}`} />
                          <span>{file.upvotes?.length || 0}</span>
                        </Button>
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => window.open(`http://localhost:5000/uploads/${file.filename}`)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex flex-col h-[500px]">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message, index) => (
                      <MessageBubble 
                        key={index}
                        message={message}
                        isOwn={message.userId === user?.id}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 border-gray-200 focus:ring-gray-900"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex flex-col items-center space-y-8">
                  <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-3xl text-white font-semibold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-800">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p className="text-slate-600">{user?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <h3 className="text-3xl font-bold text-indigo-600">{userStats?.filesUploaded || 0}</h3>
                      <p className="text-slate-600">Files Shared</p>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <h3 className="text-3xl font-bold text-emerald-600">{userStats?.totalUpvotes || 0}</h3>
                      <p className="text-slate-600">Total Likes</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 