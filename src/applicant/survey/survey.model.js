const mongoose = require("mongoose");

const obj = new mongoose.Schema({
    type: { type: String, default: '', enum: ['Registrar', 'Admission', 'Admin'] },
    courtesy: { type: Number, default: null, min: 1, max: 5 },
    service: { type: Number, default: null, min: 1, max: 5 },
    quality: { type: Number, default: null, min: 1, max: 5 },
    timeliness: { type: Number, default: null, min: 1, max: 5 },
    physical: { type: Number, default: null, min: 1, max: 5 },
    comfort: { type: Number, default: null, min: 1, max: 5 },
    comments: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "app_login", required: true },
});

module.exports = mongoose.model("surveys", obj);