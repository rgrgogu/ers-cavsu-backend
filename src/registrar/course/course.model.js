// model.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  lectureUnits: {
    type: Number,
    required: true,
  },
  labUnits: {
    type: Number,
    required: true,
  },
  prerequisite: {
    type: String, // Store the course code of the prerequisite (e.g., "FITT 1" or "None")
    required: true,
  },
  semester: {
    type: String, // e.g., "First Semester", "Second Semester", "Midyear"
    required: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;