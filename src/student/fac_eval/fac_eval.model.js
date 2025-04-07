const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const evaluationSchema = new Schema({
    professor: { 
        type: Schema.Types.ObjectId, 
        ref: 'login', 
        required: true,
        index: true 
    },
    student: { 
        type: Schema.Types.ObjectId, 
        ref: 'login', 
        required: true,
        index: true 
    },
    responses: [{
        category: { 
            type: Schema.Types.ObjectId, 
            ref: 'eval_ctgy_question', // Fixed reference to match your category list model
            required: true 
        },
        grade: { 
            type: Number, 
            min: 1, 
            max: 5, 
            required: true,
            validate: {
                validator: function(v) {
                    return Number.isInteger(v) && v >= 1 && v <= 5;
                },
                message: props => `${props.value} is not a valid grade! Grade must be between 1 and 5`
            }
        }
    }],
    submittedAt: { type: Date, default: Date.now },
}, {
    virtuals: {
        id: { get() { return this._id; } },
        gradeText: {
            get() {
                return this.responses.map(response => ({
                    category: response.category,
                    grade: response.grade,
                    text: response.grade === 1 ? "Poor" :
                          response.grade === 2 ? "Fair" :
                          response.grade === 3 ? "Good" :
                          response.grade === 4 ? "Very Good" :
                          "Excellent"
                }));
            }
        }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("evaluations", evaluationSchema);