const ChatSession = require('../models/ChatSession');
const { sendTherapistMessage, clearGeminiSession, generateChatTitle } = require('../services/chatService');

const sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Message is required' });
        }

        let session;

        if (sessionId) {
            session = await ChatSession.findOne({ _id: sessionId, userId });
            if (!session) {
                return res.status(404).json({ message: 'Chat session not found' });
            }
        } else {
            session = new ChatSession({ userId, messages: [] });
        }

        // Add user message
        session.messages.push({ role: 'user', content: message.trim() });

        // Get AI response
        const existingMessages = session.messages.slice(0, -1);
        const aiResponse = await sendTherapistMessage(userId, message.trim(), existingMessages);

        // Add AI response
        session.messages.push({ role: 'model', content: aiResponse });

        if (session.messages.length === 2) {
            session.title = await generateChatTitle(message.trim());
        }

        await session.save();

        res.status(200).json({
            sessionId: session._id,
            title: session.title,
            aiResponse,
            messages: session.messages,
        });
    } catch (err) {
        console.error('Chat error:', err.message);
        res.status(500).json({ message: err.message || 'Failed to process message' });
    }
};


const getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user._id })
            .select('title createdAt updatedAt messages')
            .sort({ updatedAt: -1 });

        // Return sessions with message count and last message preview
        const sessionList = sessions.map(s => ({
            _id: s._id,
            title: s.title,
            messageCount: s.messages.length,
            lastMessage: s.messages.length > 0
                ? s.messages[s.messages.length - 1].content.substring(0, 80) + '...'
                : '',
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));

        res.status(200).json(sessionList);
    } catch (err) {
        console.error('Get sessions error:', err.message);
        res.status(500).json({ message: 'Failed to fetch chat sessions' });
    }
};

const getSession = async (req, res) => {
    try {
        const session = await ChatSession.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        res.status(200).json(session);
    } catch (err) {
        console.error('Get session error:', err.message);
        res.status(500).json({ message: 'Failed to fetch chat session' });
    }
};

const deleteSession = async (req, res) => {
    try {
        const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id, });

        if (!session) {
            return res.status(404).json({ message: 'Chat session not found' });
        }

        clearGeminiSession(req.user._id);

        res.status(200).json({ message: 'Chat session deleted' });
    } catch (err) {
        console.error('Delete session error:', err.message);
        res.status(500).json({ message: 'Failed to delete chat session' });
    }
};

module.exports = { sendMessage, getSessions, getSession, deleteSession };
