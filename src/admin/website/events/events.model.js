const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const file = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' }
});

const obj = new Schema({
    title: {type: String, default: '', required: true},
    desc: {type: String, default: '', required: true},
    group_files: {type: [file], default: [], required: true},
    isArchived: {type: Boolean, default: false, required: true},
    updated_by: {type: Schema.Types.ObjectId, ref: 'admin_account_login', default: null},
    created_by: {type: Schema.Types.ObjectId, ref: 'admin_account_login', default: null},
    folder_id: {type: String, default: '', required: true},
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("cavsu_events", obj);