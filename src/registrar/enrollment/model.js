const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'sections', required: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    year_level: { type: String, required: true },
    enrolled_courses: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollment_details', required: true },
    enrollment_status: { type: String, enum: ['Enrolled', 'Enlisted'], default: 'Enlisted' },
    enlisted_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    date_enlisted: { type: Date, default: Date.now },
    enrolled_by: { type: String, default: null },
    date_enrolled: { type: Date, default: null },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('enrollments', obj);