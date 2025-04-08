const User = require("../../auth/login/model");

// USED
const GetAppointments = async (req, res) => {
    try {
        const result = await User.find({ status: "Applied", isArchived: false })
            .populate({
                path: "profile_id_one",
                select: "application_details appointment",
                populate: {
                    path: "appointment", 
                    select: "appointment",
                    model: "adn_appointments", 
                },
            })

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
            { $lookup: { from: "profile_ones", localField: "profile_id_one", foreignField: "_id", as: "profile" } },
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
