const mongoose = require("mongoose");

const User = require("../../auth/login/model")
const Model = require("./logs.model");
const { getIO, getOnlineUsers } = require("../../../global/config/SocketIO")
const NotificationController = require("../../applicant/app_notification/notification.controller")

const GetLogs = async (req, res) => {
    try {
        const user_id = req.params.id;
        const result = await Model.findOne({ applicant: user_id }).populate("logs.processed_by", "name");
        res.status(200).json(result)
    } catch (error) {
        res.status(400).json(error)
    }
}

const MassUpdateLogs = async (req, res) => {
    try {
        const data = req.body
        let userIds = [];

        if (data.category === "Appointment") {
            const result = await User.aggregate([
                { $match: { status: "Applied", isArchived: false } },
                { $lookup: { from: "app_profiles", localField: "_id", foreignField: "user_id", as: "profile" } },
                { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "adn_appointments", localField: "profile.appointment", foreignField: "_id", as: "profile.appointment" } },
                { $unwind: { path: "$profile.appointment", preserveNullAndEmptyArrays: true } },
                { $addFields: { "profile.appointment": "$profile.appointment.appointment" } },
                // Add a new $match stage to filter by appointment date
                { $match: { "profile.appointment.date": new Date(data.date) } },
                { $project: { id: 1 } }
            ]);

            userIds = result.map(user => user._id);
        }
        else {
            userIds = data.ids;

            if (userIds.length > 0) {
                // Step 1: Find existing users **before updating**
                const existingUsers = await Model.find({ applicant: { $in: userIds } }).distinct("applicant");

                // Step 2: Find users who need to be created
                const missingUsers = userIds.filter(id1 =>
                    !existingUsers.some(id2 => id1 === id2.toString())
                );

                // Step 3: Update existing records
                if (existingUsers.length > 0) {
                    await Model.updateMany(
                        { applicant: { $in: existingUsers } }, // Filter only existing applicants
                        {
                            $push: {
                                logs: {
                                    log: data.log,
                                    processed_by: data.processed_by,
                                    title: data.title,
                                    from: "Admission",
                                    processed_by_model: "login",
                                    timeline: data.timeline,
                                }
                            }
                        },
                        { upsert: false }
                    );
                }

                // Step 4: Insert new documents for missing users
                if (missingUsers.length > 0) {
                    const newDocs = missingUsers.map(userId => ({
                        applicant: userId,
                        logs: [{
                            log: data.log,
                            processed_by: data.processed_by,
                            title: data.title,
                            from: "Admission",
                            processed_by_model: "login",
                            timeline: data.timeline
                        }]
                    }));

                    await Model.insertMany(newDocs);
                }

                await NotificationController.sendBulkNotification(data, userIds)
            }
        }

        res.status(200).json({ message: "Update successful", updatedUsers: userIds });
    } catch (err) {
        res.status(400).json(err)
    }
}

module.exports = {
    GetLogs,
    MassUpdateLogs,
};
