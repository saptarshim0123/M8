import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sendChatMessage, getChatSessions, getChatSession, deleteChatSession } from '../api/chatAPI';
import { LuSend, LuPlus, LuTrash2, LuMessageCircle, LuSparkles, LuMenu, LuX } from 'react-icons/lu';
import toast from 'react-hot-toast';

const SUGGESTED_PROMPTS = [
    { text: "I'm feeling overwhelmed today", emoji: "😔" },
    { text: "Help me challenge a negative thought", emoji: "🧠" },
    { text: "I need a grounding exercise", emoji: "🌱" },
    { text: "I want to practice gratitude", emoji: "✨" },
    { text: "I'm anxious about something", emoji: "😰" },
    { text: "Help me with a thought record", emoji: "📝" },
];

const TypingIndicator = () => (
    <div className="flex items-start gap-3 animate-fade-in">
        <div className="chat-avatar-ai">
            <LuSparkles size={16} />
        </div>
        <div className="chat-bubble-ai">
            <div className="flex gap-1.5 items-center py-1">
                <span className="typing-dot" style={{ animationDelay: '0ms' }}></span>
                <span className="typing-dot" style={{ animationDelay: '150ms' }}></span>
                <span className="typing-dot" style={{ animationDelay: '300ms' }}></span>
            </div>
        </div>
    </div>
);

const MessageBubble = ({ msg, index }) => {
    const isUser = msg.role === 'user';
    return (
        <div
            className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}
            style={{ animationDelay: `${index * 30}ms` }}
        >
            {!isUser && (
                <div className="chat-avatar-ai">
                    <LuSparkles size={16} />
                </div>
            )}
            <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                </div>
                <div className={`text-[10px] mt-1.5 ${isUser ? 'text-primary-content/40' : 'opacity-30'}`}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </div>
            </div>
        </div>
    );
};

const Chat = () => {
    const { id: sessionIdParam } = useParams();
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(sessionIdParam || null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch all sessions
    useEffect(() => {
        fetchSessions();
    }, []);

    // Load session when changes
    useEffect(() => {
        const loadSession = async (id) => {
            try {
                const res = await getChatSession(id);
                setCurrentSessionId(id);
                setMessages(res.data.messages || []);
            } catch (err) {
                console.error('Failed to load session:', err);
                toast.error('Failed to load conversation');
                navigate('/chat');
            }
        };

        if (sessionIdParam) {
            loadSession(sessionIdParam);
        } else {
            setCurrentSessionId(null);
            setMessages([]);
        }
    }, [sessionIdParam, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const fetchSessions = async () => {
        try {
            const res = await getChatSessions();
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to load sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    };



    const handleSend = async (text = null) => {
        const messageText = text || input.trim();
        if (!messageText || loading) return;

        setInput('');
        const userMsg = { role: 'user', content: messageText, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await sendChatMessage(messageText, currentSessionId);
            const { sessionId, aiResponse } = res.data;

            if (!currentSessionId) {
                setCurrentSessionId(sessionId);
                navigate(`/chat/${sessionId}`, { replace: true });
            }

            setMessages(prev => [...prev, { role: 'model', content: aiResponse, timestamp: new Date() }]);

            // Refresh sessions list
            fetchSessions();
        } catch (err) {
            console.error('Send error:', err);
            toast.error('Failed to get response. Please try again.');
            setMessages(prev => prev.slice(0, -1)); 
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        navigate('/chat');
        setSidebarOpen(false);
    };

    const handleDeleteSession = async (id, e) => {
        e.stopPropagation();
        try {
            await deleteChatSession(id);
            toast.success('Conversation deleted');
            setSessions(prev => prev.filter(s => s._id !== id));
            if (currentSessionId === id) {
                handleNewChat();
            }
        } catch (err) {
            console.log(err.message);
            toast.error('Failed to delete');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isNewChat = messages.length === 0;

    return (
        <div className="flex h-[calc(100vh-0px)] md:h-screen overflow-hidden">
            {/* Chat History Sidebar */}
            <div className={`
                chat-sidebar
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="flex items-center justify-between p-4 border-b border-base-content/10">
                    <h2 className="font-data text-sm font-semibold text-neutral/70 uppercase tracking-wider">History</h2>
                    <div className="flex gap-1">
                        <button onClick={handleNewChat} className="btn btn-ghost btn-sm btn-circle" title="New chat">
                            <LuPlus size={18} />
                        </button>
                        <button onClick={() => setSidebarOpen(false)} className="btn btn-ghost btn-sm btn-circle md:hidden">
                            <LuX size={18} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {sessionsLoading ? (
                        <div className="space-y-2 p-2">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton h-12 w-full rounded-xl" />)}
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-xs text-neutral/30 text-center py-8 font-data">No conversations yet</p>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session._id}
                                onClick={() => {
                                    navigate(`/chat/${session._id}`);
                                    setSidebarOpen(false);
                                }}
                                className={`
                                    group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-sm
                                    ${currentSessionId === session._id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-neutral/60 hover:bg-base-200 hover:text-neutral'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <LuMessageCircle size={14} className="shrink-0" />
                                    <span className="truncate font-data text-xs">{session.title}</span>
                                </div>
                                <button
                                    onClick={(e) => handleDeleteSession(session._id, e)}
                                    className="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle text-error/60 hover:text-error transition-opacity"
                                >
                                    <LuTrash2 size={12} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Sidebar overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="btn btn-ghost btn-sm btn-circle md:hidden">
                            <LuMenu size={18} />
                        </button>
                        <div className="flex items-center gap-2.5">
                            <div className="chat-avatar-header">
                                <LuSparkles size={16} />
                            </div>
                            <div>
                                <h1 className="font-data text-sm font-semibold text-neutral">equil therapist</h1>
                                <p className="text-[11px] text-success font-data">● Online</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleNewChat} className="btn btn-ghost btn-sm gap-1 font-data text-xs">
                        <LuPlus size={14} />
                        <span className="hidden sm:inline">New Chat</span>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 chat-messages-area">
                    {isNewChat ? (
                        /* Welcome State */
                        <div className="flex flex-col items-center justify-center h-full gap-6 animate-fade-in">
                            <div className="chat-welcome-icon">
                                <LuSparkles size={32} />
                            </div>
                            <div className="text-center max-w-md">
                                <h2 className="font-heading text-2xl md:text-3xl font-bold text-neutral mb-2">
                                    Hey, I'm here for you 💛
                                </h2>
                                <p className="text-neutral/50 font-data text-sm leading-relaxed">
                                    I'm your CBT-based AI therapist. Share what's on your mind — 
                                    I'll listen, validate, and help you explore healthier perspectives.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
                                {SUGGESTED_PROMPTS.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt.text)}
                                        className="chat-prompt-pill"
                                    >
                                        <span>{prompt.emoji}</span>
                                        <span>{prompt.text}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Messages */
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg, i) => (
                                <MessageBubble key={i} msg={msg} index={i} />
                            ))}
                            {loading && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="max-w-3xl mx-auto w-full">
                        <div className="chat-input-container">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Share what's on your mind..."
                                rows={1}
                                className="chat-input"
                                disabled={loading}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
                                className="chat-send-btn"
                            >
                                <LuSend size={18} />
                            </button>
                        </div>
                        <p className="text-[10px] text-neutral/30 text-center mt-2 font-data">
                            equil therapist is AI-powered. Not a substitute for professional mental health care.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
