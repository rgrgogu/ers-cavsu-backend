const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const file = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' }
});

const obj = new Schema({
    headline: {type: String, default: '', required: true},
    desc: {type: String, default: '', required: true},
    group_files: {type: [file], default: [], required: true},
    isArchived: {type: Boolean, default: fals, required: true}
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("cavsu_events", obj);