const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'stu_login', required: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['1st', '2nd', '3rd', 'Midyear'], required: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true },
    schedules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'schedules' }],
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('enrollments', obj);