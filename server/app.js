const express = require('express')
const cors = require('cors')
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const entryRoutes = require('./routes/entryRoutes');

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);

app.get('/api/health', (req, res) => {
    res.send('API is working...')
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

module.exports = app;