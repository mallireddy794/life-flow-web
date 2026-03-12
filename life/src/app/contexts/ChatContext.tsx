import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ChatMessage = {
  id: number;
  sender: 'donor' | 'patient';
  name: string;
  text: string;
  time: string;
};

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (msg: Omit<ChatMessage, 'id' | 'time'>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'lifeflow_chat_messages';

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (msg: Omit<ChatMessage, 'id' | 'time'>) => {
    const newMessage: ChatMessage = {
      id: Date.now(),
      ...msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
