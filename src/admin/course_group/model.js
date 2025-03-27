const mongoose = require('mongoose');

const courseGroupSchema = new mongoose.Schema({
    groupName: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    program: [{ type: mongoose.Schema.Types.ObjectId, ref: 'programs' }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'courses' }],
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'reg_login', required: true },
    isArchived: { type: Boolean, default: false }
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model('course_grp', courseGroupSchema);
