const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evaluationSchema = new Schema({
    student_id: { type: Schema.Types.ObjectId, ref: "login", required: true },
    course_id: { type: Schema.Types.ObjectId, ref: "courses", required: true },
    faculty_id: { type: Schema.Types.ObjectId, ref: "login", required: true },
    school_year: { type: Schema.Types.ObjectId, ref: "school_years", required: true },
    semester: { type: String, enum: ['first', 'second', 'third', 'midyear'], required: true },
    groups_id: [{
        id: { type: Schema.Types.ObjectId, ref: "eval_ctgy_groups", required: true },
        title: { type: String, required: true },
        ratings: [{
            question_id: { type: Schema.Types.ObjectId, ref: "eval_ctgy_question", required: true },
            rating: { type: Number, min: 1, max: 5, required: true }
        }]
    }],
    comments: { type: String, default: "" },
    isCompleted: { type: Boolean, default: false, required: true }
}, {
    virtuals: {
        id: {
            get() {
                return this._id;
            }
        }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

// Add unique index to prevent duplicate evaluations
evaluationSchema.index({ student_id: 1, course_id: 1, faculty_id: 1, school_year_id: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("faculty_evaluation", evaluationSchema);