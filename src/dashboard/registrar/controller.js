const User = require("../../auth/login/model");
const Profile = require("../../auth/profile_one/model");

// RegistrarDashboardController
const RegistrarDashboardController = {
  // Get counts for Total Applications and student details
  getDashboardCounts: async (req, res) => {
    try {
      // Count total applications (all profile_ones documents)
      const totalApplications = await Profile.countDocuments({});

      // Aggregate counts for students (student_details not null)
      const studentCounts = await Profile.aggregate([
        // Match documents where student_details exists
        {
          $match: {
            student_details: { $ne: null },
          },
        },
        // Group by student_type and student_status
        {
          $group: {
            _id: {
              student_type: "$student_details.student_type",
              student_status: "$student_details.student_status",
            },
            count: { $sum: 1 },
          },
        },
        // Project to clean up output
        {
          $project: {
            _id: 0,
            student_type: "$_id.student_type",
            student_status: "$_id.student_status",
            count: 1,
          },
        },
      ]);

      // Format student counts into a structured response
      const students = {
        new: studentCounts.find((item) => item.student_type === "New")?.count || 0,
        old: {
          regular: studentCounts.find((item) => item.student_type === "Old" && item.student_status === "Regular")?.count || 0,
          irregular: studentCounts.find((item) => item.student_type === "Old" && item.student_status === "Irregular")?.count || 0,
        },
      };

      const response = {
        totalApplications,
        students,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: "Error fetching registrar dashboard counts", error: error.message });
    }
  },
};

module.exports = RegistrarDashboardController;