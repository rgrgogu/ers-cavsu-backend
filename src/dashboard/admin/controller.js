const AuthLogin = require("../../auth/login/model");
const Programs = require("../../admin/programs/model")

const DashboardAdminController = {
  // Get counts of all user roles, optionally filtered by isArchived
  getUserCounts: async (req, res) => {
    try {
      const { archive } = req.query; // Optional query parameter for isArchived
      const query = archive !== undefined ? { isArchived: archive === 'true' } : {};

      // Fetch counts for each role
      const adminCount = await AuthLogin.countDocuments({ ...query, role: "admin" });
      const admissionCount = await AuthLogin.countDocuments({ ...query, role: "admission" });
      const applicantCount = await AuthLogin.countDocuments({ ...query, role: "applicant" });
      const studentCount = await AuthLogin.countDocuments({ ...query, role: "student" });
      const facultyCount = await AuthLogin.countDocuments({ ...query, role: "faculty" });
      const registrarCount = await AuthLogin.countDocuments({ ...query, role: "registrar" });
      const programCount = await Programs.countDocuments();

      // Return the counts in a single response
      res.status(200).json({
        admins: adminCount,
        admissions: admissionCount,
        applicants: applicantCount,
        students: studentCount,
        faculty: facultyCount,
        registrars: registrarCount,
        programs: programCount
      });
    } catch (error) {
      res.status(400).json({ message: "Error fetching user counts", error: error.message });
    }
  },
};

module.exports = DashboardAdminController;