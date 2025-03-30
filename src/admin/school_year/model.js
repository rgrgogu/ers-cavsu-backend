// models/school_years.js
const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    year: { type: String, required: true, unique: true, trim: true }, // e.g., "2025-2026"
    enrollment: {
        first: { type: Boolean, default: false }, // 1st semester enrollment
        second: { type: Boolean, default: false }, // 2nd semester enrollment
        third: { type: Boolean, default: false }, // 3rd semester enrollment
        midyear: { type: Boolean, default: false }, // Midyear enrollment
    },
    faculty_eval: {
        first: { type: Boolean, default: false }, // 1st semester faculty evaluation
        second: { type: Boolean, default: false }, // 2nd semester faculty evaluation
        third: { type: Boolean, default: false }, // 3rd semester faculty evaluation
        midyear: { type: Boolean, default: false }, // Midyear faculty evaluation
    },
    grade_upload: {
        first: { type: Boolean, default: false }, // 1st semester grade uploading
        second: { type: Boolean, default: false }, // 2nd semester grade uploading
        third: { type: Boolean, default: false }, // 3rd semester grade uploading
        midyear: { type: Boolean, default: false }, // Midyear grade uploading
    },
    status: { type: Boolean, default: false },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'adm_login', required: true },
    isArchived: { type: Boolean, default: false },
}, {
    timestamps: true,
    // Middleware to ensure only one semester is true at a time
    pre: {
        save: async function (next) {
            // For semesters (enrollment)
            if (this.isModified('enrollment')) {
                const semesters = this.semesters;
                const trueCount = [semesters.first, semesters.second, semesters.third, semesters.midyear]
                    .filter(Boolean).length;

                if (trueCount > 1) {
                    throw new Error('Only one semester can be open for enrollment at a time');
                }
            }

            // For faculty evaluation
            if (this.isModified('faculty_eval')) {
                const facultyEvaluation = this.faculty_eval;
                const trueCount = [facultyEvaluation.first, facultyEvaluation.second, facultyEvaluation.third, facultyEvaluation.midyear]
                    .filter(Boolean).length;

                if (trueCount > 1) {
                    throw new Error('Only one semester can be open for faculty evaluation at a time');
                }
            }

            // For grade uploading
            if (this.isModified('grade_upload')) {
                const gradeUploading = this.grade_upload;
                const trueCount = [gradeUploading.first, gradeUploading.second, gradeUploading.third, gradeUploading.midyear]
                    .filter(Boolean).length;

                if (trueCount > 1) {
                    throw new Error('Only one semester can be open for grade uploading at a time');
                }
            }
            next();
        }
    }
});

module.exports = mongoose.model('school_years', obj);