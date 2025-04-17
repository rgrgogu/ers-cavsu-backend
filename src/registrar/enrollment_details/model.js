const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', default: null },
    pre_req_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses', default: null }],
    enrolled_count: { type: Number, min: 0, default: 0 },
    pre_req_strings: [{ type: String }],
    schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'schedules', default: null },
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'login', default: null },
    section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'sections', default: null },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', default: null },
}, { timestamps: true });

module.exports = mongoose.model('enrollment_details', obj);