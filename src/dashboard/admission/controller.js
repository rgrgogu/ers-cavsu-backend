const User = require("../../auth/login/model");
const Appointment = require("../../admission/appointments/appoint.model");
const Profile = require("../../auth/profile_one/model");

// AdmissionDashboardController
const AdmissionDashboardController = {
  // Get counts for Total Appointments and applicant statuses by type
  getDashboardCounts: async (req, res) => {
    try {
      const { archived } = req.query;
      const isArchived = archived === 'true';

      // Define applicant type options
      const options = {
        firstYear: [
          "Alternative Learning System (ALS) Passer",
          "Senior High School Graduate",
          "Currently Enrolled Grade 12 Student",
          "Foreign Undergraduate Student Applicant",
        ],
        transfereeOther: ["Transferee from Other School"],
        transfereeCVSU: [
          "Transferee from CVSU System",
          "Diploma/Certificate/Associate/Vocational Graduate",
          "Bachelor's Degree Graduate",
        ],
      };

      // Count total appointments
      const totalAppointments = await Appointment.countDocuments({});

      // Aggregation pipeline for user counts by applicant type and status
      const userCounts = await User.aggregate([
        // Match users by role and isArchived
        { $match: { role: "applicant", isArchived } },
        // Lookup profile_one to get application_details
        {
          $lookup: {
            from: "profile_ones",
            localField: "profile_id_one",
            foreignField: "_id",
            as: "profile",
          },
        },
        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
        // Group by applicant type and status
        {
          $facet: {
            firstYear: [
              {
                $match: {
                  "profile.application_details.applicant_type": { $in: options.firstYear },
                  status: { $in: ["For Review", "For Exam", "For Interview", "Confirmed", "Forfeited"] },
                },
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  status: "$_id",
                  count: 1,
                },
              },
            ],
            transfereeOther: [
              {
                $match: {
                  "profile.application_details.applicant_type": { $in: options.transfereeOther },
                  status: { $in: ["For Review", "For Exam", "For Interview", "Confirmed", "Forfeited"] },
                },
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  status: "$_id",
                  count: 1,
                },
              },
            ],
            transfereeCVSU: [
              {
                $match: {
                  "profile.application_details.applicant_type": { $in: options.transfereeCVSU },
                  status: { $in: ["For Review", "For Interview", "Confirmed", "Forfeited"] },
                },
              },
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
              {
                $project: {
                  _id: 0,
                  status: "$_id",
                  count: 1,
                },
              },
            ],
          },
        },
      ]);

      // Format counts into a structured response
      const formatCounts = (data) => ({
        forReview: data.find((item) => item.status === "For Review")?.count || 0,
        examinees: data.find((item) => item.status === "For Exam")?.count || 0,
        interview: data.find((item) => item.status === "For Interview")?.count || 0,
        confirmed: data.find((item) => item.status === "Confirmed")?.count || 0,
        forfeited: data.find((item) => item.status === "Forfeited")?.count || 0,
      });

      const response = {
        totalAppointments,
        firstYear: formatCounts(userCounts[0].firstYear),
        transfereeOther: formatCounts(userCounts[0].transfereeOther),
        transfereeCVSU: formatCounts(userCounts[0].transfereeCVSU),
      };

      // console.log(response);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: "Error fetching dashboard counts", error: error.message });
    }
  },
};

module.exports = AdmissionDashboardController;