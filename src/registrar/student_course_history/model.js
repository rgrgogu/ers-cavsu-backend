const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'students', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    grade: { type: String },
    status: { type: String, enum: ['Passed', 'Failed', 'Pending'], required: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['1st', '2nd', '3rd', 'Midyear'], required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('student_course_history', obj);