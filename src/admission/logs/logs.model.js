const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const logs_struct = new Schema({
    date: { type: Date, default: Date.now() },
    title: { type: String, default: "" },
    from: { type: String, default: "Admission", enum: ["Admission", "Applicant"] },
    log: { type: String, default: "" },
    processed_by: { type: Schema.Types.ObjectId, required: false, refPath: "logs.processed_by_model" },
    processed_by_model: { type: String, default: "login", required: true },
    timeline: {type: String, default: null, index: true, enum: ["DV", "EE", "AI", "EP"]}
});

const obj = new Schema({
    logs: { type: [logs_struct], default: [] },
    applicant: { type: Schema.Types.ObjectId, ref: 'login', index: true, default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("logs", obj);