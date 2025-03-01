const mongoose = require("mongoose");

const User = require("../../applicant/login/app_login.model");
const Profile = require("../../applicant/profile/app_profile.model");

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
        const { status, archived, option } = req.query
        const options = {
            a: ["Senior High School Graduate", "Bachelor's Degree Graduate", "Foreign Undergraduate Student Applicant", "ALS"],
            b: ["Transferee from Other School"],
            c: ["Transferee from CVSU System"]
        }

        const result = await User.aggregate([
            { $match: { status: status, isArchived: archived === true ? true : false } },
            { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "profile.application_details.applicant_type": {
                        $in: options[option]
                    }
                }
            },
            { $project: { user_id: 1, name: 1, "profile.application_details": 1, "updatedAt": 1, batch_no: 1 } }
        ]);

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}

const GetExaminees = async (req, res) => {
    try {
        const { batch_no, size } = req.query;
        const chunkSize = parseInt(size) || 10;
        const result = await User.aggregate([
            { $match: { status: "For Exam", isArchived: false, batch_no: batch_no } },
            { $project: { control_no: "$user_id", name: { $concat: ["$name.lastname", ", ", { $ifNull: ["$name.firstname", ""] }, " ", { $ifNull: ["$name.middlename", ""] }, " ", { $ifNull: ["$name.extension", ""] }] }, batch_no: 1, lastname: "$name.lastname" } },
            { $sort: { lastname: 1 } },
            { $group: { _id: null, examinees: { $push: "$$ROOT" } } },
            {
                $project: {
                    chunks: {
                        $reduce: {
                            input: "$examinees",
                            initialValue: [[]],
                            in: {
                                $cond: {
                                    if: {
                                        $gte: [
                                            {
                                                $size: {
                                                    $arrayElemAt: ["$$value", -1]
                                                }
                                            },
                                            chunkSize
                                        ]
                                    },
                                    then: {
                                        $concatArrays: ["$$value", [["$$this"]]
                                        ]
                                    },
                                    else: {
                                        $let: {
                                            vars: {
                                                lastArray: {
                                                    $arrayElemAt: ["$$value", -1]
                                                },
                                                prefix: {
                                                    $slice: ["$$value", 0, { $subtract: [{ $size: "$$value" }, 1] }]
                                                }
                                            },
                                            in: {
                                                $concatArrays: ["$$prefix", [{ $concatArrays: ["$$lastArray", ["$$this"]] }]]
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $project: { _id: 0, chunks: 1 } }
        ]);
        const examineesChunks = result.length > 0 ? result[0].chunks : [];
        res.status(200).json(examineesChunks);
    } catch (err) {
        res.status(400).json(err);
    }
};

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

const UpdateApplication = async (req, res) => {
    try {
        const data = req.body;

        // Define the update object with required status
        const updateFields = { status: data.status };

        // Add batch_no to updateFields only if it exists in the request body
        if (data.batch_no) {
            updateFields.batch_no = data.batch_no;
        }

        await User.updateMany(
            { _id: { $in: data.ids } }, // Filter: Match documents with these IDs
            { $set: updateFields }      // Update fields dynamically
        );

        res.status(200).json("Updated all items successfully");
    } catch (err) {
        res.status(400).json(err);
    }
};

module.exports = {
    GetApplications,
    GetNewApplicants,
    GetApplication,
    GetExaminees,
    UpdateApplication,
};
