const express = require('express')
const cors = require('cors')
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const entryRoutes = require('./routes/entryRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const userRoutes = require('./routes/userRoutes');
const passport = require('./config/passport');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const therapistChatRoutes = require('./routes/therapistChatRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/therapist', therapistRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/therapist-chat', therapistChatRoutes);

app.get('/api/health', (req, res) => {
    res.send('API is working...')
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

module.exports = app;