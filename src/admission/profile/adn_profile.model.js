const mongoose = require("mongoose");
const moment = require("moment");

const Schema = mongoose.Schema;

const address = new Schema({
    house_num: { type: String },
    street: { type: String, default: '' },
    brgy: { type: String, default: '', index: true },
    city: { type: String, default: '' },
    province: { type: String },
    region: { type: String },
    zip: { type: String }
});

const obj = new Schema({
    sex: { type: String, enum: ["Male", "Female"] },
    civil_status: { type: String, default: 'Single', enum: ['Single', 'Married', 'Widowed', 'Legally Separated'] },
    contact: { type: String },
    religion: { type: String },
    nationality: { type: String },
    address: { type: address, default: { ...address }},
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

module.exports = mongoose.model("adn_profile", obj);