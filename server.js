const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Local imports
const lessonService = require('./services/lessonService');
const validationService = require('./services/validationService');
const { getLessonDB } = require('./utils/db');
const { sanitizeQuery } = require('./utils/security');

const app = express();
const PORT = process.env.PORT || 5000;

// =================== ENHANCED MIDDLEWARE ===================
app.use(helmet());
app.use(cors({
  origin: [
    'https://sqlflow.vercel.app',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000'
  ].filter(Boolean),
  credentials: true
}));

app.use(bodyParser.json({ limit: '10kb' }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many feedback submissions' }
});

// Security middleware
app.use((req, res, next) => {
  // Sanitize all string inputs
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim()
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        }
      });
    }
  };
  
  sanitize(req.body);
  sanitize(req.query);
  next();
});

// =================== DATABASE CONNECTION ===================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit if DB connection fails
});

// =================== ROUTES ===================
// Health check endpoint (required for Railway)
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date() }));

// API routes
app.use('/api/auth', apiLimiter, require('./routes/auth'));
app.use('/api/progress', apiLimiter, require('./routes/progress'));

app.get('/api/lessons', (req, res) => {
  res.json(lessonService.getAllLessons());
});

app.post('/api/validate', async (req, res) => {
  try {
    const { lessonId, exerciseId, query } = req.body;
    if (!lessonId || !exerciseId || !query) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    const result = await validationService.validateSolution(query, lessonId, exerciseId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/execute', async (req, res) => {
  try {
    const { lessonId, query } = req.body;
    if (!lessonId || !query) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
    
    const db = getLessonDB(lessonId);
    const sanitized = sanitizeQuery(query);
    
    db.all(sanitized, (err, rows) => {
      db.close();
      if (err) return res.status(400).json({ error: err.message });
      res.json({
        data: rows,
        columns: rows.length > 0 ? Object.keys(rows[0]) : []
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/submit-feedback', feedbackLimiter, async (req, res) => {
  try {
    const { name = '', email = '', message, issueType = 'general' } = req.body;
    
    // Validation
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: 'Message too short' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_KEY,
        subject: `SQL-Flow ${issueType} Report`,
        name: name || 'Anonymous',
        email: email || 'no-reply@sqlflow.com',
        message,
        page_url: req.headers.referer || 'Direct',
        replyto: email,
        botcheck: false
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(502).json({ error: 'Failed to submit feedback' });
  }
});

// =================== ERROR HANDLING ===================
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// =================== SERVER START ===================
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
<<<<<<< HEAD
=======
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server closed');
      process.exit(0);
    });
  });
>>>>>>> ac793194af95c4e3050aca26d41044c5984d046b
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});