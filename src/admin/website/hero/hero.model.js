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
    image: {type: file, default: {...file}, required: true},
    hashtags: {type: [String], default: [], required: true},
    updated_by: {type: Schema.Types.ObjectId, ref: 'adm_login', default: null},
    created_by: {type: Schema.Types.ObjectId, ref: 'adm_login', default: null},
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("adm_w_hero", obj);