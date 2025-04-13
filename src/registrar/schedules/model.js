const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    day_time: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
        time: { type: String, required: true },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'room', required: true },
    }],
}, { timestamps: true });

module.exports = mongoose.model('schedules', obj);