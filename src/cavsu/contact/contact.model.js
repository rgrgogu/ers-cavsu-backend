const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const obj = new Schema({
    name: { type: String, default: '', required: true },
    position: { type: String, default: '', required: true},
    contact: { type: String, default: '', required: true},
    email: { type: String, default: '', index: true, required: true},
    year: {type: Date, required: true},
    isArchived: {type: Boolean, default: false, required: true},
    updated_by: {type: Schema.Types.ObjectId, ref: 'account_login', required: true},
    created_by: {type: Schema.Types.ObjectId, ref: 'account_login', required: true}
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("cavsu_contact", obj);