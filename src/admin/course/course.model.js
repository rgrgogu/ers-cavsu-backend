const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    lectureCredits: { type: Number, required: true, min: -1 },
    labCredits: { type: Number, required: true, min: -1 },
    lectureContact: { type: Number, required: true, min: 0 },
    labContact: { type: Number, required: true, min: 0 },
    isMajor: { type: Boolean, default: false },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'adm_login', required: true },
    isArchived: { type: Boolean, default: false },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model('courses', courseSchema);