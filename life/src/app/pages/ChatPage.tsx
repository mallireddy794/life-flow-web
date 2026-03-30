import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, Paperclip, Phone, Video, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { apiRequest } from '../services/api';

export function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const recipientId = location.state?.recipientId;
  const recipientName = location.state?.name || "Chat";
  const initials = recipientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState<{id: number, name: string} | null>(
    recipientId ? { id: recipientId, name: recipientName } : null
  );

  const fetchInbox = async () => {
    if (!user?.id) return;
    try {
      const data = await apiRequest(`/chat/inbox?user_id=${user.id}`, 'GET');
      setInbox(data || []);
    } catch (e) { console.error("Inbox fetch failed", e); }
  };

  const fetchMessages = async () => {
    if (!user?.id || !currentRecipient?.id) return;
    try {
      const data = await apiRequest(`/chat/history?user1=${user.id}&user2=${currentRecipient.id}`, 'GET');
      setMessages(data.map((m: any) => ({
        id: m.id,
        sender: m.sender_id === user.id ? 'me' : 'other',
        text: m.message,
        time: m.created_at
      })));
    } catch (e) {
      console.error("Failed to fetch chat history", e);
    }
  };

  useEffect(() => {
    fetchInbox();
    fetchMessages();
    const interval = setInterval(() => {
        fetchMessages();
        fetchInbox();
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.id, currentRecipient?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecipient?.id) {
        alert("Please select a person to chat with.");
        return;
    }
    if (message.trim() && user?.id) {
      const msgText = message;
      setMessage('');
      try {
        await apiRequest('/chat/send', 'POST', {
          sender_id: user.id,
          receiver_id: currentRecipient.id,
          message: msgText
        });
        fetchMessages();
      } catch (e) {
        console.error("Failed to send message", e);
        setMessage(msgText);
      }
    }
  };

  const currentInitials = currentRecipient?.name 
    ? currentRecipient.name.split(' ').filter(n => n).map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : "??";

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden">
      {/* Sidebar - Inbox */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold text-lg">My Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inbox.length === 0 ? (
             <div className="p-8 text-center text-gray-400 text-sm">No recent chats.</div>
          ) : (
            inbox.map((item: any) => (
              <div 
                key={item.other_user_id} 
                onClick={() => setCurrentRecipient({ id: item.other_user_id, name: item.name || 'Unknown' })}
                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-red-50 transition ${currentRecipient?.id === item.other_user_id ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                      {(item.name || 'U')[0].toUpperCase()}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="font-semibold text-sm truncate">{item.name || 'Unknown User'}</p>
                        <span className="text-[10px] text-gray-400">12:30</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.last_message || '...'}</p>
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
        {!currentRecipient ? (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-200" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Select a connection</h3>
              <p className="max-w-xs">Pick a donor or patient from your inbox to start coordinating.</p>
           </div>
        ) : (
          <>
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-md">
                  <span className="font-bold text-sm">{currentInitials}</span>
                </div>
                <div>
                  <h1 className="font-bold text-base text-gray-900 leading-tight">{currentRecipient.name || 'Unknown'}</h1>
                  <p className="text-[10px] text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 p-0 hover:bg-blue-50 text-blue-600"><Phone className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 p-0 hover:bg-blue-50 text-blue-600"><Video className="w-4 h-4" /></Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                     <p className="text-xs">This is the beginning of your chat.</p>
                  </div>
               ) : (
                 messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.sender === 'me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border rounded-tl-none'}`}>
                         <p>{msg.text}</p>
                         <p className={`text-[9px] mt-1 ${msg.sender === 'me' ? 'text-blue-100' : 'text-gray-400'}`}>12:30 PM</p>
                      </div>
                   </div>
                 ))
               )}
            </div>

            <div className="p-4 bg-white border-t">
               <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
                 <Button type="button" variant="outline" size="sm" className="rounded-full w-10 h-10 p-0"><Paperclip className="w-4 h-4" /></Button>
                 <Input 
                   placeholder="Type a message..." 
                   className="flex-1 bg-gray-100 border-none rounded-full px-5 h-10" 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                 />
                 <Button type="submit" disabled={!message.trim()} className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4" />
                 </Button>
               </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
