const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    day_time: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
        time_start: { type: String, required: true },
        time_end: { type: String, required: true },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms', required: true },
    }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('schedules', obj);