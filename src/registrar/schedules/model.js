const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'sections', required: true },
    school_year: { type: mongoose.Schema.Types.ObjectId, ref: 'school_years', required: true }, // Updated
    semester: { type: String, enum: ['1st', '2nd', '3rd', 'Midyear'], required: true },
    
    availabilityStatus: { type: Boolean, default: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
}, { timestamps: true });

module.exports = mongoose.model('schedules', obj);