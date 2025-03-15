const CourseGroup = require("../course_group/model");
const Curriculum = require("./model")
const Courses = require("../course/course.model")
const mongoose = require("mongoose")

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
      const { program, archived = false } = req.query;

      const query = { isArchived: archived === 'true' };
      if (program) {
        query.program = mongoose.Types.ObjectId(program);
      }

      const curricula = await Curriculum.find(query)
        .populate('program', 'name code')
        .populate('updated_by', 'name')
        .select("code name program total_units updated_by isArchived updatedAt")
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

  // getCurriculum: async (req, res) => {
  //   try {
  //     const id = req.params.id

  //     const result = await Curriculum.findById(id)
  //       .populate({
  //         path: 'years.semesters.1st.course_id years.semesters.2nd.course_id years.semesters.3rd.course_id years.semesters.Midyear.course_id',
  //         select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
  //       })
  //       .populate({
  //         path: 'years.semesters.1st.pre_req years.semesters.2nd.pre_req years.semesters.3rd.pre_req years.semesters.Midyear.pre_req',
  //         select: 'courseCode',
  //       })
  //       .populate('program', 'name')
  //       .lean();

  //     res.status(200).json(result)
  //   } catch (error) {
  //     res.status(400).json({
  //       success: false,
  //       message: 'Error fetching curricula',
  //       error: error.message
  //     });
  //   }
  // },
  getCurriculum: async (req, res) => {
    try {
      const id = req.params.id;

      // Step 1: Fetch the curriculum with course_id and program populated
      const result = await Curriculum.findById(id)
        .populate({
          path: 'years.semesters.1st.course_id years.semesters.2nd.course_id years.semesters.3rd.course_id years.semesters.Midyear.course_id',
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
        })
        .populate({
          path: 'program',
          select: 'name',
        })
        .lean();

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Curriculum not found',
        });
      }

      // Step 2: Collect all pre_req ObjectIds across all semesters
      const allPreReqIds = new Set();
      for (const year of result.years) {
        for (const semester of Object.values(year.semesters)) {
          for (const course of semester) {
            if (course.pre_req && course.pre_req.length > 0) {
              course.pre_req.forEach(prereq => {
                if (mongoose.Types.ObjectId.isValid(prereq)) {
                  allPreReqIds.add(prereq.toString());
                }
              });
            }
          }
        }
      }

      // Step 3: Fetch all valid pre_req courses in a single query
      let preReqMap = new Map();
      if (allPreReqIds.size > 0) {
        const populatedPreReqs = await Courses.find(
          { _id: { $in: Array.from(allPreReqIds) } },
          'courseCode'
        ).lean();
        populatedPreReqs.forEach(preReq => {
          preReqMap.set(preReq._id.toString(), { _id: preReq._id, courseCode: preReq.courseCode });
        });
      }

      // Step 4: Map pre_req values, replacing ObjectIds with populated data
      for (const year of result.years) {
        for (const semester of Object.values(year.semesters)) {
          for (const course of semester) {
            if (course.pre_req && course.pre_req.length > 0) {
              course.pre_req = course.pre_req.map(prereq =>
                mongoose.Types.ObjectId.isValid(prereq) && preReqMap.has(prereq.toString())
                  ? preReqMap.get(prereq.toString())
                  : prereq
              );
            }
          }
        }
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching curriculum',
        error: error.message,
      });
    }
  },

  createCurriculum: async (req, res) => {
    try {
      const data = req.body;
      const curriculum = await Curriculum.create(data);

      res.status(201).json(curriculum);
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