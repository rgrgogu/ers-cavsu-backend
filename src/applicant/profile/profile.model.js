const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const address = new Schema({
    street: { type: String, uppercase: true, default: '' },
    brgy: { type: String, uppercase: true, default: '', index: true },
    city: { type: String, uppercase: true, default: '' },
}, { _id: false });

const file = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' }
}, { _id: false });

const struct = new Schema({
    link: { type: String, default: "" },
    name: { type: String, default: "" },
}, { _id: false });

const socials = new Schema({
    facebook: { type: struct },
    instagram: { type: struct },
    twitter: { type: struct },
}, { _id: false });

const struct_valid_id = new Schema({
    id_type: { type: String, default: '' },
    id_number: { type: String, default: '' },
    file: { type: file, default: { ...file } }
}, { _id: false });

const verification = new Schema({
    user_folder_id: { type: String, default: "" },
    valid_id: { type: [struct_valid_id], default: [] },
    selfie: { type: file, default: { ...file } },
}, { _id: false })

const obj = new Schema({
    firstName: { type: String, default: '' },
    middleName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    suffix: { type: String, default: '' },
    religion: { type: String, default: '' },
    birthday: { type: Date },
    age: { type: Number, default: 0 },
    sex: { type: String, default: 'Male', enum: ['Male', 'Female'] },
    address: { type: address, default: { ...address } },
    occupation: { type: String, default: '' },
    civil_status: { type: String, default: 'Single', enum: ['Single', 'Married', 'Widowed', 'Legally Separated'] },
    isVoter: { type: Boolean, default: false },
    isHead: { type: Boolean, default: false },
    avatar: { type: file, default: { ...file } },
    socials: { type: socials, default: { ...socials } },
    verification: { type: verification, default: { ...verification } }
}, {
    virtuals: {
        id: { get() { return this._id; } },
        fullName: {
            get() {
                const trimmed = `${this.middleName} ${this.lastName} ${this.suffix}`;
                return `${this.firstName} ${trimmed.trim()}`.toUpperCase();
            }
        },
        fullNameInitial: {
            get() {
                const trimmed = `${this.middleName === '' ? '' : this.middleName[0] + '.'} ${this.lastName} ${this.suffix}`;
                return `${this.firstName} ${trimmed.trim()}`.toUpperCase();
            }
        },
        fullAddress: { get() { return `${this.address.street} ${this.address.brgy} ${this.address.city}, PHILIPPINES` } }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("profile", obj);