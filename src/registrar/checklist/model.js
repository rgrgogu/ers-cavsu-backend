const mongoose = require('mongoose');

const courses = new mongoose.Schema({
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
    pre_req_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    pre_req_strings: [{ type: String }],
    grade_id: { type: mongoose.Schema.Types.ObjectId, ref: 'grades', default: null },
    eval_id: { type: mongoose.Schema.Types.ObjectId, ref: 'evaluation', default: null }
}, { _id: false });

const semesters = new mongoose.Schema({
    first: [courses],
    second: [courses],
    third: [courses],
    midyear: [courses]
}, { _id: false });

const years = new mongoose.Schema({
    year: { type: String, default: '' },
    semesters: { type: semesters, default: () => ({ "first": [], "second": [], "third": [], "midyear": [] }) },
});

const checklistSchema = new mongoose.Schema({
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'login', default: null },
    code: { type: String, default: '', required: true, trim: true, match: [/^[A-Za-z0-9-]+$/, 'Identifier can only contain letters, numbers, and hyphens'], unique: true, index: true },
    name: { type: String, default: '', required: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true, index: true },
    hasFifthYear: { type: Boolean, default: false },
    years: [years],
    total_units: { type: Number, default: 0, min: 0 },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'login', required: true },
    isArchived: { type: Boolean, default: false },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model('checklist', checklistSchema);