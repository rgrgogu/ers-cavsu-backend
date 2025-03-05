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
    email: { type: String, required: true, index: true, validate: [(val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)] },
    name: { type: name, required: true, default: { ...name } },
    campus: { type: String, required: true, index: true, default: "Bacoor" },
    department: { type: String, required: true, index: true, enum: ['College', 'Masteral', 'Doctoral'] },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, index: true, enum: ['Applicant', 'Student', 'Faculty', 'Admin', 'Registrar'] },
    status: { type: String, required: true, index: true, default: 'Created', 
        enum: [
            'Created', 
            'Applied', 
            'For Review', 
            'Verified', 
            'Rejected', 
            'For Exam', 
            'Failed', 
            "Missed For Exam", 
            "Waitlisted", 
            "For Interview", 
            "Missed For Interview", 
            "For Confirmation", 
            "Confirmed", 
            "Submitted", 
            "Enrolled"
        ] },
    isArchived: { type: Boolean, required: true, index: true, default: false },
    folder_id: { type: String, default: '', required: true },
    batch_no: { type: Number, default: null, min: 1, max: 5 },
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

module.exports = mongoose.model("app_login", obj);