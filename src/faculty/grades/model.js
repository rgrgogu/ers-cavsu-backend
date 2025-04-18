const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'sections', required: true },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    grade: { type: String, required: true },
    grade_status: { type: String },
    year_level: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('grades', obj);