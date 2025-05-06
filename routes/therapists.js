const express = require('express');
const Therapist = require('../models/Therapist');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/fetch-all', async (req, res) => {
  try {
    const therapists = await Therapist.find().select('name email specialization');
    res.json(therapists);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add', auth('admin'), async (req, res) => {
  const { name, email, specialization } = req.body;
  try {
    const existingTherapist = await Therapist.findOne({ email });
    if (existingTherapist) {
      return res.status(400).json({ message: 'Therapist email already exists' });
    }
    const therapist = new Therapist({ name, email, specialization });
    await therapist.save();
    res.status(201).json({ message: 'Therapist added', therapist });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/slots', auth('user'), async (req, res) => {
  try {
    const { id, date } = req.body;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const therapist = await Therapist.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    const selectedDate = new Date(date);
    if (isNaN(selectedDate)) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({ time: `${hour}:00`, slotDate: new Date(selectedDate.setHours(hour, 0, 0, 0)).toISOString() });
    }

    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      therapistId: id,
      slotDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const availableSlots = slots.map((slot) => {
      const isBooked = bookedAppointments.some(
        (appt) => new Date(appt.slotDate).getHours() === parseInt(slot.time)
      );
      return { time: slot.time, isBooked };
    });

    res.json({ slots: availableSlots });
  } catch (error) {
    res.status(500).json({ message: `Server error : ${error}` });
  }
});
module.exports = router;