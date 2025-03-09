const mongoose = require('mongoose');

const obj = new mongoose.Schema({
    code: { type: String, required: true, unique: true, },
    name: { type: String, required: true, },
    lectureUnits: { type: Number, required: true, },
    labUnits: { type: Number, required: true, },
    prerequisite: { type: String, required: true, },
    semester: { type: String, required: true, },
    isArchived: { type: Boolean, default: false, },
});

module.exports = mongoose.model("courses", obj);