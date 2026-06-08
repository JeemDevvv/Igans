const mongoose = require('mongoose');

const ChatLogSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  lastAddedItem: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'chatlogs' });

module.exports = mongoose.model('ChatLog', ChatLogSchema);
