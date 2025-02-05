const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const obj = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    isArchived: {type: Boolean, default: false, required: true},
    group: {type: Schema.Types.ObjectId, ref: 'adm_w_faq_groups', default: null, index: true},
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

module.exports = mongoose.model("adm_w_faqs", obj);