const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const obj = new Schema({
    office_group: {type: String, default: '', required: true},
    isArchived: {type: Boolean, default: false},
    updated_by: {type: Schema.Types.ObjectId, ref: 'login', default: null},
    created_by: {type: Schema.Types.ObjectId, ref: 'login', default: null}
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("adm_w_office", obj);