// models/school_years.js
const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    year: { type: String, required: true, unique: true, trim: true }, // e.g., "2025-2026"
    semester: {type: String, default: null, enum: ["first", "second", "midyear", "third"]},
    enrollment: { type: Boolean, default: false },
    faculty_eval: { type: Boolean, default: false },
    student_eval: { type: Boolean, default: false },
    grade_upload: { type: Boolean, default: false },
    status: { type: Boolean, default: false },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    isArchived: { type: Boolean, default: false },
}, {
    timestamps: true,
});

module.exports = mongoose.model('school_years', obj);