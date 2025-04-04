const mongoose = require('mongoose');

const enrollment = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
    schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: 'schedule', default: null }, // Assuming a Schedule collection or reference
    faculty_id: { type: mongoose.Schema.Types.ObjectId, ref: 'faculty', default: null },
    grade: { type: String, enum: ['1.00', '1.25', '1.50', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00', '5.00', 'DRP', 'INC', 'W'], default: null },
    eval: { type: mongoose.Schema.Types.ObjectId, ref: 'evaluation', default: null },
    status: { type: String, enum: ['Enrolled', 'Enlisted'], default: 'Enlisted' },
    enlisted_by: {type: String, required: true },
    date_enlisted: { type: Date, default: Date.now },
    enrolled_by: { type: String, default: null },
    date_enrolled: { type: Date, default: null },
}, { _id: false })

const semesters = new mongoose.Schema({
    first: [enrollment],
    second: [enrollment],
    third: [enrollment],
    midyear: [enrollment]
}, { _id: false });

const years = new mongoose.Schema({
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    year: { type: String, default: '' },
    semesters: { type: semesters, default: () => ({ "first": [], "second": [], "third": [], "midyear": [] }) },
}, { _id: false });

const obj = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'stu_login', required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'sections', required: true },
    curriculum_id: { type: mongoose.Schema.Types.ObjectId, ref: 'curriculums', required: true },
    checklist: [years],
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('enrollments', obj);