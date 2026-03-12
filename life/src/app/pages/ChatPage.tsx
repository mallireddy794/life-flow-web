import { useNavigate, useLocation } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Send, Paperclip, Phone, Video } from 'lucide-react';
import { useState } from 'react';
import { useChat, type ChatMessage } from '../contexts/ChatContext';
import { useUser } from '../contexts/UserContext';

export function ChatPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const { messages, sendMessage } = useChat();
  const { role } = useUser();
  const location = useLocation();
  const recipientName = location.state?.name || (role === 'donor' ? 'Sarah Johnson (Patient)' : 'Suresh Reddy (Donor)');
  const initials = recipientName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();


  // chat messages are stored globally in context; all roles see the same list

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage({
        sender: role as 'donor' | 'patient',
        name: role === 'donor' ? 'Donor' : 'Patient',
        text: message,
      });
      setMessage('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white">
                <span className="font-bold">{initials}</span>
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">{recipientName}</h1>
                <p className="text-sm text-green-600">● Online</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Video className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {messages.map((msg: ChatMessage) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-md ${msg.sender === 'patient' ? 'order-2' : 'order-1'}`}>
                  <div className={`rounded-2xl px-4 py-3 ${msg.sender === 'patient'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                    <p>{msg.text}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${msg.sender === 'patient' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <Button type="button" variant="outline" size="sm">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
