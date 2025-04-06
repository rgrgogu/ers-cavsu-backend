const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const name = new Schema({
    firstname: { type: String, default: '' },
    middlename: { type: String, default: '' },
    lastname: { type: String, default: '', index: true },
    extension: { type: String, default: '' },
}, { _id: false });

const obj = new Schema({
    user_id: { type: String, index: true },
    personal_email: { type: String, default: null, index: true },
    school_email: { type: String, default: null, index: true },
    contact_number: { type: String, required: true, index: true, validate: [(val) => /^\d{11}$/.test(val)] },
    name: { type: name, required: true, default: { ...name } },
    birthdate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const today = new Date();
                const age = today.getFullYear() - value.getFullYear();
                const monthDiff = today.getMonth() - value.getMonth();
                const dayDiff = today.getDate() - value.getDate();
                return age > 16 || (age === 16 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));
            },
            message: 'User must be at least 16 years old.',
        },
    },
    username: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, required: true, index: true, enum: ['applicant', 'student', 'faculty', 'admin', 'admission', 'registrar'] },
    status: {
        type: String, required: true, index: true, default: 'Created',
        enum: [
            'Created', 'Applied', 'For Review', 'Verified', 'Rejected', 'For Exam',
            'Failed', "Missed For Exam", "Waitlisted", "For Interview", "Missed For Interview",
            "For Confirmation", "Confirmed", "Forfeited", "For Registrar", "Submitted", "Application Completed",
        ],
        index: true
    },
    isArchived: { type: Boolean, required: true, index: true, default: false },
    folder_id: { type: String, default: '' },
    profile_id_one: { type: Schema.Types.ObjectId, ref: 'profile_one', default: null, index: true }, // applicable for applicant and student,
    profile_id_two: { type: Schema.Types.ObjectId, ref: 'profile_two', default: null, index: true }, // applicable for faculty, registrar, admin, and admission,
    access_id: { type: Schema.Types.ObjectId, ref: 'access_list', default: null, index: true }, // applicable for faculty, registrar, admin, and admission,
}, {
    virtuals: {
        id: { get() { return this._id; } },
        fullName: {
            get() {
                const trimmed = [this.name.firstname, this.name.middlename, this.name.lastname, this.name.extension]
                    .filter(Boolean) // Remove empty or null values
                    .join(' ');
                return `${trimmed}`.trim();
            }
        },
        fullNameInitial: {
            get() {
                const middleInitial = this.name.middlename ? `${this.name.middlename[0].toUpperCase()}.` : '';
                const trimmed = [this.name.firstname, middleInitial, this.name.lastname, this.name.extension]
                    .filter(Boolean) // Remove empty or null values
                    .join(' ');
                return `${trimmed}`.trim();
            }
        },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("login", obj);