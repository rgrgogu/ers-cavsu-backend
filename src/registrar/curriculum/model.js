const mongoose = require('mongoose');

const schecklist = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
  semester: {
    type: String,
    required: true,
    enum: [
      '1-1', '1-2', '1-3', '1-M', // First Year: Sem 1, Sem 2, Sem 3, Mid-Year
      '2-1', '2-2', '2-3', '2-M', // Second Year
      '3-1', '3-2', '3-3', '3-M', // Third Year
      '4-1', '4-2', '4-3', '4-M'  // Fourth Year
    ]
  },
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }]
});

const curriculumSchema = new mongoose.Schema({
  identifier: { type: String, default: '', required: true }, // e.g., "1-BSIT" or "Full-BSIT" based on logic
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true },
  checklist: [schecklist], // Embedded array of checklist items
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
}, {
  virtuals: {
    id: { get() { return this._id; } },
  },
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  timestamps: true,
});

// Ensure unique combination of program and identifier
curriculumSchema.index({ program: 1, identifier: 1 }, { unique: true });

module.exports = mongoose.model('curriculum', curriculumSchema);