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

const file = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' }
});

const personal_info = new Schema({
    id_pic: {type: file, default: { ...file }},
    sex: { type: String, enum: ["Male", "Female"] },
    dob: { type: Date },
    civil_status: { type: String, default: 'Single', enum: ['Single', 'Married', 'Widowed', 'Legally Separated'] },
    contact: { type: String },
    religion: { type: String },
    nationality: { type: String },
    address: { type: address, default: { ...address }},
    disabled: { type: Boolean, default: false},
    indigenous: { type: Boolean, default: false}
})

const fam_struct = new Schema({
    isApplicable: {type: Boolean, default: false},
    full_name: {type: String, default: ''},
    contact: {type: String, default: ''},
    occupation: {type: String},
    attended_college: {type: Boolean, default: false}
}, { _id: false })

const family_profile = new Schema({
    num_siblings: {type: Number, default: 1},
    income: { type: String },
    father: { type: fam_struct, default: { ...fam_struct }},
    mother: { type: fam_struct, default: { ...fam_struct }},
    guardian: { type: fam_struct, default: { ...fam_struct }},
})

const educ_struct = new Schema({
    school_name: {type: String, default: ''},
    school_address: {type: String, default: ''},
    type: {type: String, default: ''},
    year_grad: {type: Number},
}, { _id: false })

const educational_profile = new Schema({
    elementary: { type: educ_struct, default: { ...educ_struct }},
    jhs: { type: educ_struct, default: { ...educ_struct }},
    shs: { type: educ_struct, default: { ...educ_struct }},
})

const upload_struct = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    type: {type: String, default: ''}
})

const upload_reqs = new Schema({
   files: {type: [upload_struct], default: [], required: true}
})

const applicant_details = new Schema({
    applicant_type: {type: String},
    track: {type: String, default: null},
    strand: {type: String, default: null},
    program: {type: String, default: ''}
})

const obj = new Schema({
    application_details: {type: applicant_details, default: {...applicant_details}},
    applicant_profile: {type: personal_info, default: {...personal_info}},
    family_profile: {type: family_profile, default: {...family_profile}, required: true},
    educational_profile: {type: educational_profile, default: {...educational_profile}, required: true},
    upload_reqs: {type: upload_reqs, default: {...upload_reqs}},
    appointment: {type: Date, required: true},
}, {
    virtuals: {
        id: { get() { return this._id; } },
        fullAddress: { 
            get() { 
                return `${this.applicant_profile.address.house_num} ${this.applicant_profile.address.street}, Barangay ${this.applicant_profile.address.brgy}, ${this.applicant_profile.address.city}, ${this.applicant_profile.address.province}, ${this.applicant_profile.address.region}, ${this.applicant_profile.address.zip}` 
            } 
        }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("applicant_profile", obj);