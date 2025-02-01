const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const name = new Schema({
    firstname: { type: String, default: '' },
    middlename: { type: String, default: ''},
    lastname: { type: String, default: '',  index: true },
    extension: { type: String, default: '' },
}, { _id: false });

const obj = new Schema({
    user_id: { type: String, index: true },
    email: { type: String, required: true, index: true, validate: [(val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)]},
    name: { type: name, required: true, default: { ...name } },
    birthdate: { type: Date, required: true },
    campus: { type: String, required: true, index: true, default: "Bacoor" },
    department: { type: String, required: true, index: true, enum: ['College', 'Masteral', 'Doctoral'] },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, index: true, enum: ['Applicant', 'Student', 'Faculty', 'Admin', 'Registrar'] },
    status: { type: String, required: true, index: true, default: 'For Review', enum: ['For Review', 'Scheduled', 'Taked EE', 'Passed', 'Failed'] },
    isArchived: { type: Boolean, required: true, index: true, default: false },
    profile: { type: Schema.Types.ObjectId, ref: 'profile', default: null },
}, {
    virtuals: {
        id: { get() { return this._id; } },
        fullName: {
            get() {
                const trimmed = `${this.name.middlename} ${this.name.lastname} ${this.name.extension}`;
                return `${this.name.firstname} ${trimmed.trim()}`.toUpperCase();
            }
        },
        fullNameInitial: {
            get() {
                const trimmed = `${this.name.middlename === '' ? '' : this.name.middlename[0] + '.'} ${this.name.lastname} ${this.name.extension}`;
                return `${this.name.firstname} ${trimmed.trim()}`.toUpperCase();
            }
        },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

// Middleware to generate user_id before saving
obj.pre('save', async function (next) {
    if (!this.user_id && this.role === 'Applicant') {
        const User = mongoose.model('User', obj);
        const count = await User.countDocuments() + 1; // Get the next count
        const year = new Date().getFullYear();

        // Format count with leading zeros to be 6 digits
        const paddedCount = count.toString().padStart(6, '0');

        this.user_id = `${year}A${paddedCount}`; // e.g., 2025A000001
    }
    next();
});

module.exports = mongoose.model("applicant_account_login", obj);