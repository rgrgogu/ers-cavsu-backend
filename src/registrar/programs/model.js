const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const obj = new Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
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

module.exports = mongoose.model("programs", obj);