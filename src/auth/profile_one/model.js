const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const address = new Schema({
    house_num: { type: String },
    street: { type: String, default: '' },
    brgy: { type: String, default: '', index: true },
    city: { type: String, default: '' },
    province: { type: String },
    region: { type: String },
    country: { type: String },
    zip: { type: String }
});

const file = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' }
});

const personal_info = new Schema({
    id_pic: { type: file, default: { ...file } },
    sex: { type: String, enum: ["Male", "Female"] },
    civil_status: { type: String, default: 'Single', enum: ['Single', 'Married', 'Widowed', 'Legally Separated'] },
    religion: { type: String },
    nationality: { type: String },
    address: { type: address, default: { ...address } },
    disabled: { type: Boolean, default: false },
    disablity: { type: String, default: '' },
    indigenous: { type: Boolean, default: false },
    indigenous_group: { type: String, default: '' },
}, {
    virtuals: {
        fullAddress: {
            get() {
                if (this.address) {
                    return `${this.address.house_num || ''} ${this.address.street || ''}, Barangay ${this.address.brgy || ''}, ${this.address.city || ''}, ${this.address.province || ''}, ${this.address.region || ''}, ${this.address.country || ''}, ${this.address.zip || ''}`.trim();
                }
                return null;
            }
        }
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

const fam_struct = new Schema({
    isApplicable: { type: Boolean, default: false },
    full_name: { type: String, default: '' },
    contact: { type: String, default: '' },
    occupation: { type: String },
    attended_college: { type: Boolean, default: false }
}, { _id: false })

const family_profile = new Schema({
    num_siblings: { type: Number, default: 0 },
    income: { type: String },
    father: { type: fam_struct, default: { ...fam_struct } },
    mother: { type: fam_struct, default: { ...fam_struct } },
    guardian: { type: fam_struct, default: { ...fam_struct } },
})

const educ_struct = new Schema({
    school_name: { type: String, default: '' },
    school_address: { type: String, default: '' },
    enrolled_program: { type: String, default: null },
    type: { type: String, default: null },
    year_grad: { type: Number, default: null },
}, { _id: false })

const educational_profile = new Schema({
    elementary: { type: educ_struct, default: { ...educ_struct } },
    jhs: { type: educ_struct, default: { ...educ_struct } },
    shs: { type: educ_struct, default: { ...educ_struct } },
    college_diploma: { type: educ_struct, default: null }
})

const upload_struct = new Schema({
    link: { type: String, default: '' },
    id: { type: String, default: '' },
    name: { type: String, default: '' },
    type: { type: String, default: '' }
})

const applicant_details = new Schema({
    applicant_type: { type: String, default: '' },
    track: { type: String, default: null },
    strand: { type: String, default: null },
    program: { type: String, default: '' }
})

const exam_details = new Schema({
    date: { type: String, default: '' },
    time: { type: String, default: null },
    venue: { type: String, default: null },
    batch_no: { type: Number, default: null, min: 1, max: 5 },
    processed_by: { type: Schema.Types.ObjectId, ref: 'login', required: true }
})

// STUDENT
const student_details = new Schema({
    student_type: { type: String, default: null, enum: ['New', 'Old', 'Graduated'] },
    student_status: { type: String, default: null, enum: ['Regular', 'Irregular'] },
    enrollment_id: { type: Schema.Types.ObjectId, ref: 'enrollment', default: null, index: true },
    year_level: { type: Number, default: 1, min: 1, max: 5, index: true },
    section_id: { type: Schema.Types.ObjectId, ref: 'sections', default: null, index: true }
})

const obj = new Schema({
    application_details: { type: applicant_details, default: null },
    applicant_profile: { type: personal_info, default: null },
    family_profile: { type: family_profile, default: null },
    educational_profile: { type: educational_profile, default: null },
    upload_reqs: { type: [upload_struct], default: [] },
    appointment: { type: Schema.Types.ObjectId, ref: 'adn_appointments', default: null },
    exam_details: { type: exam_details, default: null },
    student_details: { type: student_details, default: null }
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("profile_one", obj);