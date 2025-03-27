const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    section_code: { type: String, required: true, unique: true, trim: true },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true },
    semester: { type: String, enum: ['1st', '2nd', '3rd', 'Midyear'], required: true },
    capacity: { type: Number, required: true, min: 1 },
    enrolled_count: { type: Number, default: 0, min: 0 },
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

module.exports = mongoose.model('sections', obj);