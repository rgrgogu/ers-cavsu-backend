const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true, index: true },
  semester: {
    type: String,
    required: true,
    enum: [
      '1-1', '1-2', '1-3', '1-M', // First Year: Sem 1, Sem 2, Sem 3, Mid-Year
      '2-1', '2-2', '2-3', '2-M', // Second Year
      '3-1', '3-2', '3-3', '3-M', // Third Year
      '4-1', '4-2', '4-3', '4-M'  // Fourth Year
    ],
    validate: {
      validator: function(v) {
        return /^\d-[1-3M]$/.test(v);
      },
      message: props => `${props.value} is not a valid semester format!`
    }
  },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses', default: [] }]
});

const curriculumSchema = new mongoose.Schema({
  identifier: { type: String, default: '', required: true, trim: true, match: [/^[A-Za-z0-9-]+$/, 'Identifier can only contain letters, numbers, and hyphens'] },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true, index: true },
  checklist: [checklistSchema], // Embedded array of checklist items
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
  isArchived: { type: Boolean, default: false },
  totalCredits: { type: Number, default: 0 }
}, {
  virtuals: {
    id: { get() { return this._id; } },
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
});

module.exports = mongoose.model('curriculum', curriculumSchema);