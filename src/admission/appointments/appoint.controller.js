const mongoose = require("mongoose");

const User = require("../../applicant/login/app_login.model");

const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../../../global/utils/Drive");

const GetAppointments = async (req, res) => {
    try {
        const result = await User.aggregate([
            { $match: { status: "Applied", isArchived: false } },
            { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "adn_appointments", localField: "profile.appointment", foreignField: "_id", as: "profile.appointment" } },
            { $unwind: { path: "$profile.appointment", preserveNullAndEmptyArrays: true } },
            { $addFields: { "profile.appointment": "$profile.appointment.appointment" } },
            { $project: { user_id: 1, name: 1, "profile.application_details": 1, "profile.appointment": 1, "updatedAt": 1 } }
        ]);

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}

const GetSelectedAppointees = async (req, res) => {
    try {
        const date = req.query.date
        
        const result = await User.aggregate([
            { $match: { status: "For Review", isArchived: false } },
            { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "adn_appointments", localField: "profile.appointment", foreignField: "_id", as: "profile.appointment" } },
            { $unwind: { path: "$profile.appointment", preserveNullAndEmptyArrays: true } },
            { $addFields: { "profile.appointment": "$profile.appointment.appointment" } },
            // Add a new $match stage to filter by appointment date
            { $match: { "profile.appointment.date": new Date(date) } },
            { $project: { user_id: 1, name: 1, "profile.application_details": 1, "profile.appointment": 1, "updatedAt": 1 } }
        ]);

        // Format the response
        const formattedResult = result.map((applicant) => ({
            control_no: applicant.user_id,
            name: [applicant.name.firstname, applicant.name.middlename, applicant.name.lastname, applicant.name.extension]
                .filter(Boolean) // Removes empty values
                .join(" "), // Ensures proper spacing
            type: applicant.profile.application_details.applicant_type,
            program: applicant.profile.application_details.program
        }));

        res.status(200).json(formattedResult);
    } catch (err) {
        res.status(400).json(err)
    }
}

module.exports = {
    GetAppointments,
    GetSelectedAppointees
};
