const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Therapist = require('../models/Therapist');
const auth = require('../middleware/auth');


router.get('/fetch-appointments', auth('user'), async (req, res) => {
  try {
    const userId = req.user.userId;

    const appointments = await Appointment.find({ userId })
      .populate('therapistId', 'name specialization')
      .sort({ slotDate: 1 }); 

    res.json({ appointments });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

router.post('/book', auth('user'), async (req, res) => {
  try {
    const { therapistId, slotDate } = req.body;

    if (!therapistId || !slotDate) {
      return res.status(400).json({ message: 'Therapist ID and slot date are required' });
    }

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ message: 'Therapist not found' });
    }

    console.log(slotDate)
    const slotDateObj = new Date(slotDate);
    console.log(slotDate)
    const existingAppointment = await Appointment.findOne({
      therapistId,
      slotDate: {
        $gte: new Date(slotDateObj.setSeconds(0, 0)),
        $lt: new Date(slotDateObj.setSeconds(3600, 0)),
      },
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'Slot is already booked' });
    }

    const appointment = new Appointment({
      therapistId,
      userId: req.user.userId, 
      slotDate: slotDate,
      status: 'Scheduled',
    });

    await appointment.save();
    res.json({ message: 'Appointment booked' });
  } catch (error) {
    res.status(500).json({ message: `Server error : ${error}` });
  }
});

module.exports = router;