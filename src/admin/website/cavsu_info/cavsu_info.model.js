const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vismis_struct = new Schema({
    eng: { type: String, default: '' },
    fil: { type: String, default: ''},
});

const obj = new Schema({
    mandate: {type: String, default: ''},
    vision: {type: vismis_struct, default: {...vismis_struct}},
    mission: {type: vismis_struct, default: {...vismis_struct}},
    core_val: {type: [String], default: []},
    quality_pol: {type: String, default: ''},
    history: {type: String, default: ''},
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("adm_w_info", obj);