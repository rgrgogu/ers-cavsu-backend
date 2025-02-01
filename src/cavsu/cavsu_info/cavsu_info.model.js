/* Homepage Information: Basic university information, news, and announcements
    Mandate
    Vision
    Mithiin ng Pamantasan
    Mission
    Hangarin ng Pamantasan
    Core Values
    Quality policy
    History
    
 Admission Guidelines: View course offerings and entrance requirements
    image

Registration & Enrollment: Online registration forms for new and returning students, View available 	courses and enrollment schedules
visit link nalang

Contact Details: Directory and inquiry forms
contact_info []
    {
     name, position, contact, email
    }

Campus Events: Access to public events and activities
Create Event
*/

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vismis_struct = new Schema({
    eng: { type: String, default: '' },
    fil: { type: String, default: ''},
});

const obj = new Schema({
    mandate: {type: String, default: ''},
    vision: {type: vismis_struct, default: {...vismis_struct}},
    mission: {type: vismis_struct, default: {...vismis_struct}},
    core_val: {type: [String], default: []},
    quality_pol: {type: String, default: ''},
    history: {type: String, default: ''},
}, {
    virtuals: {
        id: { get() { return this._id; } },
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
});

module.exports = mongoose.model("cavsu_info", obj);