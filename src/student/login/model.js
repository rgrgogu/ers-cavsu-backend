const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const name = new Schema({
    firstname: { type: String, default: '' },
    middlename: { type: String, default: '' },
    lastname: { type: String, default: '', index: true },
    extension: { type: String, default: '' },
}, { _id: false });

const obj = new Schema({
    student_id: { type: String, index: true, required: true, unique: true },
    personal_email: { type: String, required: true, index: true, validate: [(val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)] },
    cvsu_email: { type: String, required: true, index: true, validate: [(val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)] },
    name: { type: name, required: true, default: { ...name } },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Student' },
    student_type: { type: String, enum: ['New', 'Old'], required: true, default: "New" },
    enrollment_status: { type: String, enum: ['Regular', 'Irregular'], required: true, default: "Regular" },
    program: { type: mongoose.Schema.Types.ObjectId, ref: 'programs', required: true },
    year_level: { type: String, enum: ["1st", "2nd", "3rd", "Midyear"], default: '1st' }, // e.g., "1st", "2nd", etc.
    updated_by: { type: mongoose.Schema.Types.ObjectId, refPath: 'updated_by_model', required: true },
    updated_by_model: { type: String, required: true, enum: ['stu_login', 'reg_login', 'adm_login'], default: "adm_login" },
    isArchived: { type: Boolean, default: false, index: true },
    folder_id: { type: String, default: '', required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'app_profile', required: true }
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
                const trimmed = this.name.middlename === '' ? '' : `${this.name.middlename[0] + '.'} ${this.name.lastname} ${this.name.extension}`;
                return `${this.name.firstname} ${trimmed.trim()}`.toUpperCase();
            }
        },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

// Pre-save middleware to generate student_id and hash password
obj.pre('save', async function (next) {
    const doc = this;

    // Only generate student_id if it's not already set
    if (!doc.student_id) {
        try {
            const count = await this.constructor.countDocuments() + 1; // Get the next count
            const year = new Date().getFullYear();

            // Format count with leading zeros to be 6 digits
            const paddedCount = count.toString().padStart(6, '0');
            doc.student_id = `${year}${paddedCount}`; // e.g., 2025000001
        } catch (error) {
            return next(error);
        }
    }

    doc.username = doc.password = "Student12345"

    next(); // Proceed to save
});

module.exports = mongoose.model("stu_login", obj);