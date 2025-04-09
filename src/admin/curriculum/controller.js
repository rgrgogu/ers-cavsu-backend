const CourseGroup = require("../course_group/model");
const Curriculum = require("./model")
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
          select: 'courseCode courseTitle credits'
        })
        .select('groupName courses')
        .lean();

      if (!groups || groups.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No groups found matching the criteria'
        });
      }

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

  getCurriculum: async (req, res) => {
    try {
      const id = req.params.id

      const result = await Curriculum.findById(id)
        .populate({
          path: 'years.semesters.first.course_id years.semesters.second.course_id years.semesters.third.course_id years.semesters.midyear.course_id',
          select: 'courseCode courseTitle credits',
        })
        .populate({
          path: 'years.semesters.first.pre_req_ids years.semesters.second.pre_req_ids years.semesters.third.pre_req_ids years.semesters.midyear.pre_req_ids',
          select: 'courseCode',
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

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching curriculum',
        error: error.message,
      });
    }
  },

  getCurriculaByProgramAndSemester: async (req, res) => {
    try {
      const { programName, semester } = req.query;
  
      if (!programName || !semester) {
        return res.status(400).json({
          success: false,
          message: 'Program name and semester are required parameters',
        });
      }
  
      const validSemesters = ['first', 'second', 'third', 'midyear'];
      if (!validSemesters.includes(semester)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester value. Must be one of: first, second, third, midyear',
        });
      }
  
      const curricula = await Curriculum.find()
        .populate({
          path: 'program',
          match: { name: programName },
          select: 'name',
        })
        .populate({
          path: `years.semesters.${semester}.course_id`,
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
        })
        .populate({
          path: `years.semesters.${semester}.pre_req_ids`,
          select: 'courseCode',
        })
        .lean();
  
      const filteredCurricula = curricula.filter(curriculum => 
        curriculum.program &&
        curriculum.years.some(year => 
          year.semesters && 
          year.semesters[semester] && 
          year.semesters[semester].course_id.length > 0
        )
      );
  
      if (filteredCurricula.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No curricula found for program '${programName}' in ${semester} semester`,
        });
      }
  
      res.status(200).json({
        success: true,
        data: filteredCurricula,
        count: filteredCurricula.length,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching curricula',
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
      const data = req.body;

      const updatedCurriculum = await Curriculum.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );

      if (!updatedCurriculum) {
        return res.status(404).json({
          success: false,
          message: 'Curriculum not found',
        });
      }

      res.status(200).json(updatedCurriculum);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating curriculum',
        error: error.message,
      });
    }
  },

  archiveCurriculum: async (req, res) => {
    try {
      const { ids, archived, updated_by } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of course group IDs' });
      }
      if (typeof archived !== 'boolean') {
        return res.status(400).json({ message: 'Archived status must be a boolean' });
      }
      if (!updated_by) {
        return res.status(400).json({ message: 'Updated_by field is required' });
      }

      const result = await Curriculum.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            isArchived: archived,
            updated_by: updated_by,
          }
        },
        { new: true }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'No course groups found with provided IDs' });
      }

      res.json({
        message: `${result.modifiedCount} course group(s) archived successfully`,
        modifiedCount: result.modifiedCount,
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