const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const obj = new Schema({
    name: { type: String, default: '', required: true },
    position: { type: String, default: '', required: true},
    contact: { type: String, default: '', required: true},
    email: { type: String, default: '', index: true, required: true},
    isArchived: {type: Boolean, default: false},
    updated_by: {type: Schema.Types.ObjectId, ref: 'adm_login', default: null},
    created_by: {type: Schema.Types.ObjectId, ref: 'adm_login', default: null}
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("adm_w_contact", obj);