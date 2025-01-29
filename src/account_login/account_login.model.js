const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const obj = new Schema({
    user_id: { type: String, required: true, index: true },
    email: {
        type: String, required: true, index: true, validate: [
            (val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val),
        ],
    },
    contact: { type: String, required: true, index: true },
    username: { type: String, required: true, index: true },
    password: { type: String, required: true, index: true },
    account_type: { type: String, required: true, index: true, enum: ['Head Admin', 'Barangay Admin', 'Barangay Staff', 'Resident'] },
    acc_status: { type: String, required: true, index: true, default: 'For Review', enum: ['For Review', 'Partially Verified', 'Fully Verified', 'Denied'] },
    isArchived: { type: Boolean, required: true, index: true, default: false },
    otp: { type: String },
    pin: { type: String },
    brgy: { type: String, required: true, uppercase: true, index: true },
    profile: { type: Schema.Types.ObjectId, ref: 'profile' },
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("account_login", obj);