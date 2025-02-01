const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const file = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' }
});

const obj = new Schema({
    group_name: {type: String, default: '', required: true},
    group_desc: {type: String, default: '', required: true},
    group_files: {type: [file], default: [], required: true },
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

module.exports = mongoose.model("cavsu_ers", obj);