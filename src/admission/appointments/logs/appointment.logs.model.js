const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const logs_struct = new Schema({
    date: { type: Date, default: Date.now() },
    title: { type: String, default: "" },
    from: { type: String, default: "Admission", enum: ["Admission", "Applicant"] },
    status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
    log: { type: String, default: "" },
    processed_by: { type: Schema.Types.ObjectId, required: false, refPath: "processed_by_model" },
    processed_by_model: { type: String, enum: ["adn_login", "app_login"], required: true }
});

const obj = new Schema({
    logs: { type: [logs_struct], default: [] },
    applicant: { type: Schema.Types.ObjectId, ref: 'app_login', index: true, default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("logs_appntment", obj);