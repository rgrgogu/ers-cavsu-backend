const mongoose = require('mongoose');

const courses = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'courses' },
  pre_req: [{
    type: mongoose.Schema.Types.Mixed, ref: "courses", validate: {
      validator: function (value) {
        // Ensure the value is either a valid ObjectId or a string
        return (
          mongoose.Types.ObjectId.isValid(value) ||
          typeof value === 'string'
        );
      },
      message: 'pre_req must be either a valid ObjectId or a string',
    }
  }]
}, { _id: false });

const semesters = new mongoose.Schema({
  "1st": [courses],
  "2nd": [courses],
  "3rd": [courses],
  "Midyear": [courses]
}, { _id: false });

const years = new mongoose.Schema({
  year: { type: String, default: '' },
  semesters: { type: semesters, default: () => ({ "1st": [], "2nd": [], "3rd": [], "Midyear": [] }) },
}, { _id: false });

const curriculumSchema = new mongoose.Schema({
  code: { type: String, default: '', required: true, trim: true, match: [/^[A-Za-z0-9-]+$/, 'Identifier can only contain letters, numbers, and hyphens'], unique: true, index: true },
  name: { type: String, default: '', required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true, index: true },
  hasFifthYear: { type: Boolean, default: false },
  years: [years],
  total_units: { type: Number, default: 0, min: 0 },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
  isArchived: { type: Boolean, default: false },
}, {
  virtuals: {
    id: { get() { return this._id; } },
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
});

module.exports = mongoose.model('curriculum', curriculumSchema);