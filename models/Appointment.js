const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotDate: { type: Date, required: true },
  status: { type: String, default: 'Scheduled' },
});


appointmentSchema.index({ therapistId: 1, slotDate: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);