const mongoose = require('mongoose');

const courses = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
  pre_req_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
  pre_req_strings: [{ type: String }],
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

const curriculumSchema = new mongoose.Schema({
  code: { type: String, default: '', required: true, trim: true, index: true },
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

module.exports = mongoose.model('curricula', curriculumSchema);