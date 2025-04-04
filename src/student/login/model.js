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
    school_email: { type: String, index: true, validate: [(val) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(val)] },
    name: { type: name, required: true, default: { ...name } },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Student' },
    student_type: { type: String, enum: ['New', 'Old'], required: true, default: "New" },
    student_status: { type: String, enum: ['Regular', 'Irregular'], required: true, default: "Regular" },
    program: { type: String, required: true },
    year_level: { type: Number, min: 1, max: 5, default: 1, index: true },
    updated_by: { type: mongoose.Schema.Types.ObjectId, refPath: 'updated_by_model', required: true },
    updated_by_model: { type: String, required: true, enum: ['stu_login', 'reg_login', 'adm_login'], default: "adm_login" },
    isArchived: { type: Boolean, default: false, index: true },
    folder_id: { type: String, default: '', required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'app_profile', required: true },
    enrollment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'enrollments', default: null },
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

module.exports = mongoose.model("stu_login", obj);