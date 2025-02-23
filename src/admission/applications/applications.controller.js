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

        const result = await User.aggregate([
            { $match: { status: status, isArchived: archived === true ? true : false } },
            { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "adn_appointments", localField: "profile.appointment", foreignField: "_id", as: "profile.appointment" } },
            { $unwind: { path: "$profile.appointment", preserveNullAndEmptyArrays: true } },
            { $addFields: { "profile.appointment": "$profile.appointment.appointment" } },
            { $project: { name: 1, "profile.application_details": 1, "profile.appointment": 1, "updatedAt": 1 } }
        ]);

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}

module.exports = {
    GetApplications
};
