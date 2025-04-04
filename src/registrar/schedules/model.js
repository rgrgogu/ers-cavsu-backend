const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'sections', required: true, index: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    schedule: [{
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
        time_start: { type: String, required: true },
        time_end: { type: String, required: true },
        room: { type: mongoose.Schema.Types.ObjectId, ref: 'rooms', required: true },
        faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'faculty', default: null },
        type: { type: String, enum: ['Lecture', 'Laboratory'], default: null },
    }],
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('schedules', obj);