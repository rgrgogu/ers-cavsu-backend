const CourseGroup = require("../course_group/model");

const curriculumController = {
  getGroupsWithCourses: async (req, res) => {
    try {
      const { program } = req.query;

      const conditions = { isArchived: false };
      if (program) conditions.$or = [{ program: null }, { program: { $in: [program] } }];
      else conditions.program = null;

      const groups = await CourseGroup.find(conditions)
        .populate({
          path: 'courses',
          match: { isArchived: false },
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact'
        })
        .select('groupName courses') // Select fields from the Group model
        .lean();

      if (!groups || groups.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No groups found matching the criteria'
        });
      }

      // Optional: Filter out groups with no courses
      const filteredGroups = groups.filter(group => group.courses.length > 0);

      if (filteredGroups.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No groups with active courses found'
        });
      }

      res.status(200).json(filteredGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching groups',
        error: error.message
      });
    }
  }
};

module.exports = curriculumController;