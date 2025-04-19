const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const facultyEvaluationSchema = new Schema({
    title: { type: String, required: true },
    groups_id: [{ type: Schema.Types.ObjectId, ref: 'eval_ctgy_groups', required: true }],
    isActive: { type: Boolean, default: true, required: true },
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

module.exports = mongoose.model("evaluation_list", facultyEvaluationSchema);