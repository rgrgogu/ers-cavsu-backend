const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const address = new Schema({
    house_num: { type: String, default: '' },
    street: { type: String, default: '' },
    brgy: { type: String, default: '', index: true },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
    region: { type: String, default: '' },
    zip: { type: String, default: '' }
});

const obj = new Schema({
    sex: { type: String, default: '', enum: ["Male", "Female"] },
    civil_status: { type: String, default: 'Single', enum: ['Single', 'Married', 'Widowed', 'Legally Separated'] },
    contact: { type: String, default: '' },
    religion: { type: String, default: '' },
    nationality: { type: String, default: '' },
    address: { type: address, default: { ...address } },
}, {
    virtuals: {
        id: { get() { return this._id; } },
        fullAddress: {
            get() {
                return `${this.address.house_num} ${this.address.street}, Barangay ${this.address.brgy}, ${this.address.city}, ${this.address.province}, ${this.address.region}, ${this.address.zip}`
            }
        }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("profile_two", obj);