// models/Issue.js
const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: false
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  screenshot: {
    type: String, // Will store file path or URL
    required: false
  }
});

module.exports = mongoose.model('Issue', IssueSchema);