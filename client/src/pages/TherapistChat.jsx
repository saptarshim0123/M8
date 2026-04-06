import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChatRoom } from '../api/therapistChatAPI';
import { getSocket } from '../api/socket';
import { useAuth } from '../hooks/useAuth';
import { LuArrowLeft, LuSend } from 'react-icons/lu';
import Avatar from 'boring-avatars';

const TherapistChat = () => {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Scroll to bottom on new messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Load existing messages
        getChatRoom(roomId)
            .then(res => {
                setRoom(res.data);
                setMessages(res.data.messages || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));

        // Setup socket
        const socket = getSocket();
        if (socket) {
            socketRef.current = socket;
            socket.emit('joinRoom', roomId);

            socket.on('message', (msg) => {
                setMessages(prev => [...prev, msg]);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leaveRoom', roomId);
                socketRef.current.off('message');
            }
        };
    }, [roomId]);

    useEffect(scrollToBottom, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        if (socketRef.current) {
            socketRef.current.emit('message', { room: roomId, text: text.trim() });
        }
        setText('');
    };

    // Determine the other person's info
    const otherPerson = room
        ? (room.therapistId?._id === user?._id ? room.userId : room.therapistId)
        : null;

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-base-200">
            {/* Header */}
            <div className="navbar bg-base-100 border-b px-4 shrink-0">
                <div className="flex-1 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm btn-square">
                        <LuArrowLeft size={18} />
                    </button>
                    {otherPerson && (
                        <div className="flex items-center gap-2">
                            {otherPerson.avatar ? (
                                <img src={otherPerson.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <div className="shrink-0 overflow-hidden rounded-full">
                                    <Avatar size={32} name={otherPerson.name} variant="beam"
                                        colors={['#c4a882', '#7a5c3a', '#f5ede0', '#3d2b1f', '#e8d8c4']} />
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-sm">{otherPerson.name}</p>
                                <p className="text-xs text-neutral/40">
                                    {user?.role === 'therapist' ? 'Patient' : 'Therapist'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-neutral/40 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isMine = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                        return (
                            <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm
                                    ${isMine
                                        ? 'bg-primary text-primary-content rounded-br-md'
                                        : 'bg-base-100 border border-base-content/10 rounded-bl-md'
                                    }`}
                                >
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-content/50' : 'text-neutral/30'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-base-100 border-t shrink-0">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        placeholder="Type a message..."
                        className="input input-bordered flex-1 rounded-full"
                        autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-circle" disabled={!text.trim()}>
                        <LuSend size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TherapistChat;
