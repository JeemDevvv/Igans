const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatLog', ChatLogSchema);
