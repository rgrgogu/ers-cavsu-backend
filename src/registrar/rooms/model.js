const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login' }
}, {
  timestamps: true
});

module.exports = mongoose.model('room', RoomSchema);
