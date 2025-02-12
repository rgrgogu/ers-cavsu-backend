const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const appoint_struct = new Schema({
    date: { type: Date },
    time: { type: String, enum: ["AM", "PM"], index: true },
}, { _id: false });

const obj = new Schema({
    appointment: { type: appoint_struct, default: { ...appoint_struct } },
    user: { type: Schema.Types.ObjectId, ref: 'adn_login', default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("adn_appointments", obj);