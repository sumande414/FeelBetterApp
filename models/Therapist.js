const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  specialization: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Therapist', therapistSchema);