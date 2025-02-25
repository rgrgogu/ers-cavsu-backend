const mongoose = require("mongoose");

const User = require("../../applicant/login/app_login.model");
const Profile = require("../../applicant/profile/app_profile.model");

const BCrypt = require("../../../global/config/BCrypt");

const { CreateEmailToken, VerifyTokenInReset, CreateAccessToken, CreateRefreshToken, VerifyRefreshToken } = require("../../../global/functions/CreateToken");
const CheckUser = require("../../../global/functions/CheckUser");
const { Send } = require("../../../global/config/Nodemailer")

const GetApplications = async (req, res) => {
    try {
        const { status, archived } = req.query

        // const result = await User.aggregate([
        //     { $match: { status: status, isArchived: archived === true ? true : false } },
        //     { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
        //     { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
        //     { $lookup: { from: "adn_appointments", localField: "profile.appointment", foreignField: "_id", as: "profile.appointment" } },
        //     { $unwind: { path: "$profile.appointment", preserveNullAndEmptyArrays: true } },
        //     { $addFields: { "profile.appointment": "$profile.appointment.appointment" } },
        //     { $project: { name: 1, "profile.application_details": 1, "profile.appointment": 1, "updatedAt": 1 } }
        // ]);

        const result = await User.aggregate([
            { $match: { status: status, isArchived: archived === true ? true : false } },
            { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            // { $lookup: { from: "adn_appointments", localField: "profile.appointment", foreignField: "_id", as: "profile.appointment" } },
            // { $unwind: { path: "$profile.appointment", preserveNullAndEmptyArrays: true } },
            // { $addFields: { "profile.appointment": "$profile.appointment.appointment" } },
            { $project: { user_id: 1, name: 1, "profile.application_details": 1, "updatedAt": 1 } }
        ]);

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}

// Getting all applicants for Senior High School Graduate, 
// Bachelor's Degree Graduate, Foreign Undergraduate Student
// ALS
const GetNewApplicants = async (req, res) => {
    try {
        const { status, archived } = req.query

        const result = await User.aggregate([
            { $match: { status: status, isArchived: archived === true ? true : false } },
            { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "profile.application_details.applicant_type": {
                        $in: [
                            "Senior High School Graduate",
                            "Bachelor's Degree Graduate",
                            "Foreign Undergraduate Student Applicant",
                            "ALS"
                        ]
                    }
                }
            },
            { $project: { user_id: 1, name: 1, "profile.application_details": 1, "updatedAt": 1 } }
        ]);

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}

const GetApplication = async (req, res) => {
    try {
        const user_id = req.params.id;

        const user = await User.findOne({ _id: user_id });

        const profile = await Profile.findOne({ user_id: user_id }).populate({
            path: 'appointment',
            select: 'appointment updatedAt',
        })

        res.status(200).json({ user, profile })
    } catch (err) {
        res.status(400).json(err)
    }
}

const UpdateApplicationForAppointees = async (req, res) => {
    try {
        const data = req.body

        const result = await User.updateMany(
            { _id: { $in: data.ids } }, // Filter: Match documents with these IDs
            { $set: { status: "For Review", batch_no: data.batch_no } } // Update fields
        );

        res.status(200).json("Updated all items successfully");
    } catch (err) {
        res.status(400).json(err)
    }
}
module.exports = {
    GetApplications,
    GetNewApplicants,
    GetApplication,
    UpdateApplicationForAppointees
};
