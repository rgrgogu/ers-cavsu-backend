const Profile = require("./model")
const User = require("../login/model")

const Appointment = require("../../admission/appointments/appoint.model")

const UploadApplicantFiles = require("../../../global/functions/UploadApplicantFiles")
const { UploadFiles, DeleteFiles } = require("../../../global/utils/Drive");

function processAppointments(appointments) {
    const counts = {}

    appointments.forEach(app => {
        const dateStr = app.appointment.date.toISOString().split("T")[0] // Extract YYYY-MM-DD
        if (!counts[dateStr]) {
            counts[dateStr] = { AM: 0, PM: 0 }
        }
        counts[dateStr][app.appointment.time]++
    })

    return Object.entries(counts)
        .map(([date, count]) => ({
            date,
            AM: count.AM,
            PM: count.PM
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
}

const fetchAppointments = async (year, month) => {
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString()
    const endDate = new Date(
        Date.UTC(year, month, 0, 23, 59, 59, 999)
    ).toISOString()

    try {
        const appointments = await Appointment.find({
            "appointment.date": {
                $gte: startDate,
                $lte: endDate
            }
        }).lean()

        return appointments
    } catch (error) {
        console.error("Error fetching appointments:", error)
        throw error
    }
}

const ApplicantProfileController = {
    // USED
    GetProfile: async (req, res) => {
        try {
            const profile_id = req.params.id;

            const result = await Profile.findById(profile_id)
                .populate({
                    path: 'appointment',
                    select: 'appointment updatedAt', // Include only these fields in the populated appointment
                })
                .select('application_details applicant_profile family_profile educational_profile upload_reqs appointment exam_details'); // Include only these fields in the Profile

            res.status(200).json(result);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    GetAppointmentSlots: async (req, res) => {
        try {
            const { year, month } = req.params
            // const startDate = new Date(year, month - 1, 2)
            // const endDate = new Date(year, month, 1)

            const appointments = await fetchAppointments(year, month)
            const processedData = processAppointments(appointments)

            res.status(200).json(processedData)
        } catch (error) {
            console.error("Error fetching counts:", error);
        }
    },

    // USED
    EditApplicationDetails: async (req, res) => {
        try {
            const profile_id = req.params.id;
            const data = req.body;

            const result = await Profile.findByIdAndUpdate(
                profile_id,
                { application_details: data },
                { new: true }
            ).select('application_details'); // Select only the application_details field

            if (!result) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json(result.application_details);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // USED
    EditApplicantProfile: async (req, res) => {
        try {
            let obj = {}
            const profile_id = req.params.id;
            const { folder_id, deleted_id } = req.query;

            const { body, file } = req;
            const data = JSON.parse(body.obj)
            const DOCUMENT_MAX_SIZE = 1024 * 1024;

            if (file) {
                if (file.size > DOCUMENT_MAX_SIZE) {
                    return res.status(400).json({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` });
                }

                const { id, name } = await UploadFiles(file, folder_id);

                obj = {
                    link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                    id,
                    name
                }
            }

            if (deleted_id)
                await DeleteFiles(deleted_id);

            const result = await Profile.findByIdAndUpdate(
                profile_id,
                {
                    $set: {
                        applicant_profile: {
                            ...data,
                            id_pic: file ? obj : data.id_pic,
                        },
                    },
                },
                { new: true }
            ).select('applicant_profile');;

            if (!result) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json(result.applicant_profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // USED
    EditFamilyProfile: async (req, res) => {
        try {
            const profile_id = req.params.id;
            const data = req.body;

            const result = await Profile.findByIdAndUpdate(
                profile_id,
                { $set: { family_profile: data } },
                { new: true }
            ).select('family_profile');

            if (!result) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json(result.family_profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // USED
    EditEducationalProfile: async (req, res) => {
        try {
            const profile_id = req.params.id;
            const data = req.body;

            const result = await Profile.findByIdAndUpdate(
                profile_id,
                { $set: { educational_profile: data } },
                { new: true }
            ).select('educational_profile');

            if (!result) {
                return res.status(404).json({ message: "Profile not found" });
            }

            res.status(200).json(result.educational_profile);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // USED
    EditUploadRequirements: async (req, res) => {
        try {
            let result = null;

            const profile_id = req.params.id;
            const { body, files } = req;
            const { folder_id } = req.query;
            const deletedList = JSON.parse(body.deleted)
            const doc_type = JSON.parse(body.doc_type);

            if (files.length != 0) {
                const { err, documents } = await UploadApplicantFiles(files, folder_id, doc_type)

                if (err.length === 0) {
                    result = await Profile.findByIdAndUpdate(
                        profile_id,
                        { $push: { upload_reqs: documents } },
                        { new: true }
                    ).select('upload_reqs');

                    if (!result) {
                        return res.status(404).json({ message: "Profile not found" });
                    }
                }
                else
                    return res.status(400).json(err);
            }

            if (deletedList && deletedList?.length !== 0) {
                for (const file of deletedList) await DeleteFiles(file.id);

                const del_arr = deletedList.map((item) => item.id)

                const output = await Profile.findByIdAndUpdate(
                    profile_id, // Find the group by its ID
                    { $pull: { upload_reqs: { id: { $in: del_arr } } } },
                    { new: true }
                ).select('upload_reqs');

                return res.status(200).json(output.upload_reqs);
            }
            else return res.status(200).json(result.upload_reqs);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // USED
    EditAppointment: async (req, res) => {
        try {
            const profile_id = req.params.id;
            const isUpdate = req.query.isUpdate;
            const data = req.body;

            const result = await Appointment.findByIdAndUpdate(
                profile_id,   // Search condition
                { $set: { ...data, user: profile_id } }, // Create only if it doesn't exist
                { upsert: true, new: true } // Ensures document is created if missing
            );

            if (!result) {
                return res.status(404).json({ message: "Cannot appointment" });
            }

            if (isUpdate === "true") {
                const output = await Profile.findByIdAndUpdate(
                    profile_id,
                    { $set: { appointment: result._id } },
                    { new: true }
                ).select('appointment');

                const updateRole = await User.findOneAndUpdate(
                    { profile_id_one: profile_id },
                    { $set: { status: "Applied" } },
                    { new: true }
                ).select('status')

                return res.status(200).json({ result, output: output.appointment, status: updateRole.status });
            }
            else
                return res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    UpdateApplication: async (req, res) => {
        try {
            const user_id = req.params.id;
            const data = req.body;

            const updatedUser = await User.findByIdAndUpdate(
                { _id: user_id },                   // The ID to find
                { $set: { status: data.status } },    // Update fields dynamically
                { new: true }              // Return the updated document
            );

            res.status(200).json({
                message: "Updated item successfully",
                data: updatedUser
            });
        } catch (err) {
            res.status(400).json(err);
        }
    }
}

module.exports = ApplicantProfileController
