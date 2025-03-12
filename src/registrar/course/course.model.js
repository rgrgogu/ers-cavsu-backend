const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    lectureCredits: { type: Number, required: true, min: 0 },
    labCredits: { type: Number, required: true, min: 0 },
    courseType: { type: String, enum: ['General Education', 'Specialized', 'Elective', 'NSTP', 'Physical Education', 'Practicum/OJT'], required: true },
    program: { type: String, required: function () { return ['Specialized', 'Elective', 'Practicum/OJT'].includes(this.courseType); }, default: null },
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

module.exports = mongoose.model('courses', courseSchema);