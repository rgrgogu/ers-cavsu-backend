const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryListSchema = new Schema({
    question: { type: String, required: true },
    group: {type: Schema.Types.ObjectId, ref: 'eval_ctgy_groups',required: true,index: true},
    isArchived: { type: Boolean, default: false, required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: 'adm_login', default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'adm_login', default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("eval_ctgy_question", categoryListSchema);