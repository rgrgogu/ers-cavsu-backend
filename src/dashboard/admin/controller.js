const AuthLogin = require("../../auth/login/model");
const Programs = require("../../admin/programs/model");

const DashboardAdminController = {
  // Get counts of all user roles, separated by archived and non-archived status
  getUserCounts: async (req, res) => {
    try {
      // Fetch non-archived counts (isArchived: false)
      const adminCount = await AuthLogin.countDocuments({ isArchived: false, role: "admin" });
      const admissionCount = await AuthLogin.countDocuments({ isArchived: false, role: "admission" });
      const applicantCount = await AuthLogin.countDocuments({ isArchived: false, role: "applicant" });
      const studentCount = await AuthLogin.countDocuments({ isArchived: false, role: "student" });
      const facultyCount = await AuthLogin.countDocuments({ isArchived: false, role: "faculty" });
      const registrarCount = await AuthLogin.countDocuments({ isArchived: false, role: "registrar" });

      // Fetch archived counts (isArchived: true)
      const adminArchiveCount = await AuthLogin.countDocuments({ isArchived: true, role: "admin" });
      const admissionArchiveCount = await AuthLogin.countDocuments({ isArchived: true, role: "admission" });
      const applicantArchiveCount = await AuthLogin.countDocuments({ isArchived: true, role: "applicant" });
      const studentArchiveCount = await AuthLogin.countDocuments({ isArchived: true, role: "student" });
      const facultyArchiveCount = await AuthLogin.countDocuments({ isArchived: true, role: "faculty" });
      const registrarArchiveCount = await AuthLogin.countDocuments({ isArchived: true, role: "registrar" });

      // Fetch program count (unchanged)
      const programCount = await Programs.countDocuments();

      // Return the counts in a single response
      res.status(200).json({
        admins: adminCount,
        adminArchived: adminArchiveCount,
        admissions: admissionCount,
        admissionArchived: admissionArchiveCount,
        applicants: applicantCount,
        applicantArchived: applicantArchiveCount,
        students: studentCount,
        studentArchived: studentArchiveCount,
        faculty: facultyCount,
        facultyArchived: facultyArchiveCount,
        registrars: registrarCount,
        registrarArchived: registrarArchiveCount,
        programs: programCount
      });
    } catch (error) {
      res.status(400).json({ message: "Error fetching user counts", error: error.message });
    }
  },

  getAdminDashboard: async (req, res) => {
    try {
      const systemYear = parseInt(req.query.system_year) || new Date().getFullYear();

      // Define date range
      const startOfYear = new Date(`${systemYear}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${systemYear + 1}-01-01T00:00:00.000Z`);

      const results = {};

      // 1. Applicant — filter by createdAt date range
      const applicantData = await AuthLogin.aggregate([
        {
          $match: {
            role: "applicant",
            isArchived: false,
            createdAt: {
              $gte: startOfYear,
              $lt: endOfYear
            }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      results.applicant = {
        total: applicantData.reduce((sum, s) => sum + s.count, 0),
        statuses: Object.fromEntries(applicantData.map(s => [s._id, s.count]))
      };

      // 2. Faculty/Admin/Registrar/Admission — active and archived totals
      const staffRoles = ["faculty", "admin", "admission", "registrar"];
      const staffData = await AuthLogin.aggregate([
        {
          $match: { role: { $in: staffRoles } }
        },
        {
          $group: {
            _id: { role: "$role", isArchived: "$isArchived" },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.role",
            totals: {
              $push: {
                isArchived: "$_id.isArchived",
                count: "$count"
              }
            }
          }
        }
      ]);

      for (const entry of staffData) {
        const role = entry._id;
        const active = entry.totals.find(t => !t.isArchived)?.count || 0;
        const archived = entry.totals.find(t => t.isArchived)?.count || 0;
        results[role] = {
          total: active + archived,
          active,
          archived
        };
      }

      // 3. Students — group by profile_one.student_details.student_status
      const studentData = await AuthLogin.aggregate([
        {
          $match: {
            role: "student",
            isArchived: false,
            profile_id_one: { $ne: null }
          }
        },
        {
          $lookup: {
            from: "profile_ones", // check if this matches your actual MongoDB collection
            localField: "profile_id_one",
            foreignField: "_id",
            as: "profile"
          }
        },
        { $unwind: "$profile" },
        {
          $addFields: {
            studentType: "$profile.student_details.student_type",
            studentStatus: "$profile.student_details.student_status"
          }
        },
        {
          $project: {
            group: {
              $cond: [
                { $eq: ["$studentType", "Graduated"] },
                "Graduated",
                {
                  $concat: ["$studentType", " ", "$studentStatus"] // e.g. "Old Regular"
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$group",
            count: { $sum: 1 }
          }
        }
      ]);

      // Build the formatted student result
      results.student = {
        total: studentData.reduce((sum, s) => sum + s.count, 0),
        statuses: Object.fromEntries(studentData.map(s => [s._id, s.count]))
      };

      // Fetch program count (unchanged)
      const programs = await Programs.find({ isArchived: false }).select({ name: 1, code: 1 });

      results.programs = {
        total: programs.length,
        list: programs
      }

      res.status(200).json({
        message: "Admin dashboard data fetched successfully",
        data: results
      });

    } catch (error) {
      res.status(400).json({
        message: "Error fetching admin dashboard data",
        error: error.message
      });
    }
  },

  getLandingCounts: async (req, res) => {
    try {
      // Count students
      const studentCount = await AuthLogin.countDocuments({ role: "student" });

      // Aggregate unique staff by full name
      const staffAggregation = await AuthLogin.aggregate([
        {
          $match: {
            role: { $in: ["admin", "admission", "faculty", "registrar"] }
          }
        },
        {
          $addFields: {
            fullName: {
              $concat: [
                { $ifNull: ["$name.firstname", ""] },
                " ",
                { $ifNull: ["$name.middlename", ""] },
                " ",
                { $ifNull: ["$name.lastname", ""] },
                " ",
                { $ifNull: ["$name.extension", ""] }
              ]
            }
          }
        },
        {
          $group: {
            _id: "$fullName"
          }
        },
        {
          $count: "total"
        }
      ]);

      const staffCount = staffAggregation[0]?.total || 0;

      // Count programs
      const programCount = await Programs.countDocuments();

      // Respond
      res.status(200).json({
        programs: programCount,
        students: studentCount,
        staffs: staffCount,
      });
    } catch (error) {
      res.status(400).json({
        message: "Error fetching landing counts",
        error: error.message
      });
    }
  }
};

module.exports = DashboardAdminController;