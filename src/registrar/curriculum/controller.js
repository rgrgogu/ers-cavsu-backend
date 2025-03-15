const CourseGroup = require("../course_group/model");
const Curriculum = require("./model")

const curriculumController = {
  getGroupsWithCourses: async (req, res) => {
    try {
      const { program } = req.query;

      const conditions = { isArchived: false };
      if (program) conditions.$or = [{ program: [] }, { program: { $in: [program] } }];
      else conditions.program = [];

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
      res.status(400).json({
        success: false,
        message: 'Server error while fetching groups',
        error: error.message
      });
    }
  },

  getCurricula: async (req, res) => {
    try {
      const { program, isArchived = false } = req.query;

      const query = { isArchived: isArchived === 'true' };
      if (program) {
        query.program = mongoose.Types.ObjectId(program);
      }

      const curricula = await Curriculum.find(query)
        .populate('program', 'name code')
        .populate('updated_by', 'name')
        .sort('createdAt');

      res.status(200).json(curricula);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching curricula',
        error: error.message
      });
    }
  },

  createCurriculum: async (req, res) => {
    try {
      const data = req.body;
      console.log(data)
      
      // const curriculum = await Curriculum.create(data);

      // res.status(201).json(curriculum);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error creating curriculum',
        error: error.message
      });
    }
  },

  updateCurriculum: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updated_by: req.user._id,
        updatedAt: Date.now()
      };

      const curriculum = await Curriculum.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('program', 'name code')
        .populate('updated_by', 'username email');

      if (!curriculum) {
        return res.status(404).json({
          success: false,
          message: 'Curriculum not found'
        });
      }

      res.status(200).json({
        success: true,
        data: curriculum,
        message: 'Curriculum updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating curriculum',
        error: error.message
      });
    }
  },

  archiveCurriculum: async (req, res) => {
    try {
      const { id } = req.params;
      const { isArchived } = req.body;

      const curriculum = await Curriculum.findByIdAndUpdate(
        id,
        {
          isArchived: isArchived === true,
          updated_by: req.user._id,
          updatedAt: Date.now()
        },
        { new: true }
      )
        .populate('program', 'name code')
        .populate('updated_by', 'username email');

      if (!curriculum) {
        return res.status(404).json({
          success: false,
          message: 'Curriculum not found'
        });
      }

      res.status(200).json({
        success: true,
        data: curriculum,
        message: `Curriculum ${isArchived ? 'archived' : 'unarchived'} successfully`
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error archiving curriculum',
        error: error.message
      });
    }
  }
};

module.exports = curriculumController;