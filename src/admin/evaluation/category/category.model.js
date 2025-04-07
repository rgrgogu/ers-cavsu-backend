const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoryGroupSchema = new Schema({
    title: { type: String, required: true },
    isArchived: { type: Boolean, default: false, required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: 'login', default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'login', default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("eval_ctgy_groups", categoryGroupSchema);