const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const holiday_struct = new Schema({
    date: { type: Date },
    name: { type: String, default: '' },
    type: { type: String, enum: ['Regular', 'Special Non-Working', 'Special Working']}
}, { _id: false });

const obj = new Schema({
    holidays: { type: [holiday_struct], default: [] },
    year: { type: Number, required: true },
    isArchived: { type: Boolean, required: true, index: true, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'adn_login', default: null },
    created_by: { type: Schema.Types.ObjectId, ref: 'adn_login', default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("adn_holiday", obj);