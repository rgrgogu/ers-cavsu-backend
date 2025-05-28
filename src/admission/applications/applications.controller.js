const User = require("../../auth/login/model");
const Profile = require("../../auth/profile_one/model");
const { getIO, getOnlineUsers } = require("../../../global/config/SocketIO");

const GetApplicants = async (req, res) => {
    try {
        const { status, archived, option } = req.query

        const options = {
            a: ["Alternative Learning System (ALS) Passer", "Senior High School Graduate", "Currently Enrolled Grade 12 Student", "Foreign Undergraduate Student Applicant"],
            b: ["Transferee from Other School"],
            c: ["Transferee from CVSU System", "Diploma/Certificate/Associate/Vocational Graduate", "Bachelor's Degree Graduate"]
        }

        const result = await User.aggregate([
            { $match: { status: Array.isArray(status) ? { $in: status } : status, isArchived: archived === true ? true : false } },
            { $lookup: { from: "profile_ones", localField: "profile_id_one", foreignField: "_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "profile.application_details.applicant_type": {
                        $in: options[option]
                    }
                }
            },
            { $project: { user_id: 1, name: 1, "profile.application_details": 1, "updatedAt": 1, status: 1, "profile.exam_details": 1, "profile_id_one": 1 } }
        ]);

        res.status(200).json(result)
    } catch (err) {
        res.status(400).json(err)
    }
}

const GetExaminees = async (req, res) => {
    try {
        const { batch_no, date, time, option } = req.query;
        const batchNo = parseInt(batch_no) || batch_no;

        const options = {
            a: ["Alternative Learning System (ALS) Passer", "Senior High School Graduate", "Currently Enrolled Grade 12 Student", "Foreign Undergraduate Student Applicant"],
            b: ["Transferee from Other School"],
            c: ["Transferee from CVSU System", "Diploma/Certificate/Associate/Vocational Graduate", "Bachelor's Degree Graduate"]
        }

        const result = await User.aggregate([
            { $match: { status: "For Exam", isArchived: false } },
            { $lookup: { from: "profile_ones", localField: "profile_id_one", foreignField: "_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "profile.application_details.applicant_type": {
                        $in: options[option]
                    },
                    "profile.exam_details.date": date,
                    "profile.exam_details.time": time,
                    "profile.exam_details.batch_no": batchNo
                }
            },
            { $project: { control_no: "$user_id", name: { $concat: ["$name.lastname", ", ", { $ifNull: ["$name.firstname", ""] }, " ", { $ifNull: ["$name.middlename", ""] }, " ", { $ifNull: ["$name.extension", ""] }] }, lastname: "$name.lastname", venue: "$profile.exam_details.venue" } },
            { $sort: { lastname: 1 } },
        ]);

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const GetApplicantsByProgram = async (req, res) => {
    try {
        const { status, program, batch_no, option } = req.query;
        const batchNo = parseInt(batch_no) || batch_no;

        const options = {
            a: ["Alternative Learning System (ALS) Passer", "Senior High School Graduate", "Currently Enrolled Grade 12 Student", "Foreign Undergraduate Student Applicant"],
            b: ["Transferee from Other School"],
            c: ["Transferee from CVSU System", "Diploma/Certificate/Associate/Vocational Graduate", "Bachelor's Degree Graduate"]
        }

        const result = await User.aggregate([
            { $match: { status: status, isArchived: false } },
            { $lookup: { from: "profile_ones", localField: "profile_id_one", foreignField: "_id", as: "profile" } },
            { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "profile.application_details.applicant_type": {
                        $in: options[option]
                    },
                    "profile.application_details.program": program,
                    "profile.exam_details.batch_no": batchNo
                }
            },
            { $project: { control_no: "$user_id", name: { $concat: ["$name.lastname", ", ", { $ifNull: ["$name.firstname", ""] }, " ", { $ifNull: ["$name.middlename", ""] }, " ", { $ifNull: ["$name.extension", ""] }] }, batch_no: 1, lastname: "$name.lastname" } },
            { $sort: { lastname: 1 } },
        ]);

        console.log(result)

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
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

        const io = getIO();
        const onlineUsers = getOnlineUsers();

        await User.updateMany(
            { _id: { $in: data.ids } }, // Filter: Match documents with these IDs
            { $set: { status: data.status } }      // Update fields dynamically
        );

        data.ids.map(id => {
            const user_id = id.toString()
            // Check if user is online and send notification
            if (onlineUsers.has(user_id)) {
                io.to(onlineUsers.get(user_id)).emit("newStatus", {
                    message: "New status received",
                    status: data.status,
                });
            }
        })

        res.status(200).json("Updated all items successfully");
    } catch (err) {
        res.status(400).json(err);
    }
};

const UpdateExamDetails = async (req, res) => {
    try {
        const data = req.body;
        const { user_ids, ids, ...rest } = data;

        const io = getIO();
        const onlineUsers = getOnlineUsers();

        await Profile.updateMany(
            { _id: { $in: ids } }, // Filter: Match documents with these IDs
            { $set: { exam_details: { ...rest } } }      // Update fields dynamically
        );

        user_ids.map(id => {
            const user_id = id.toString()
            // Check if user is online and send notification
            if (onlineUsers.has(user_id)) {
                io.to(onlineUsers.get(user_id)).emit("newExamDetails", {
                    message: "New exam details received",
                    exam_details: rest,
                });
            }
        })

        res.status(200).json("Updated all items successfully");
    } catch (err) {
        res.status(400).json(err);
    }
};

module.exports = {
    GetApplicants,
    GetApplication,
    GetApplicantsByProgram,
    GetExaminees,
    UpdateApplication,
    UpdateExamDetails
};
