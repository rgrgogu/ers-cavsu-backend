const CourseGroup = require("../../admin/course_group/model");
const Curriculum = require("../../admin/curriculum/model")
const Courses = require("../../admin/course/course.model")
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

  getCurriculum: async (req, res) => {
    try {
      const id = req.params.id

      const result = await Curriculum.findById(id)
        .populate({
          path: 'years.semesters.1st.course_id years.semesters.2nd.course_id years.semesters.3rd.course_id years.semesters.Midyear.course_id',
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
        })
        .populate({
          path: 'years.semesters.1st.pre_req_ids years.semesters.2nd.pre_req_ids years.semesters.3rd.pre_req_ids years.semesters.Midyear.pre_req_ids',
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
      // Get query parameters
      const { program, semester, year } = req.query;
  
      // Validate required parameters
      if (!program || !semester || !year) {
        return res.status(400).json({
          success: false,
          message: 'Program name, semester, and year are required parameters',
        });
      }
  
      // Define valid semesters and years
      const validSemesters = ['first', 'second', 'third', 'midyear'];
      const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  
      // Validate semester and year
      if (!validSemesters.includes(semester) || !validYears.includes(year)) {
        return res.status(400).json({
          success: false,
          message: `Invalid semester or year. Semester must be one of: ${validSemesters.join(', ')}. Year must be one of: ${validYears.join(', ')}`,
        });
      }
  
      // Find curricula and populate relevant fields
      const curricula = await Curriculum.find({ isArchived: false })
        .populate({
          path: 'program',
          match: { name: program },
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
  
      // Filter and transform curricula to only include the specified year and semester
      const filteredCurricula = curricula
        .filter(curriculum => 
          curriculum.program && // Ensure program exists
          curriculum.years.some(y => 
            y.year === year && 
            y.semesters?.[semester]?.length > 0 && 
            y.semesters[semester].some(course => course.course_id)
          )
        )
        .map(curriculum => ({
          ...curriculum,
          years: curriculum.years
            .filter(y => y.year === year)
            .map(y => ({
              year: y.year,
              semesters: { [semester]: y.semesters[semester] },
            })),
        }));
  
      if (!filteredCurricula.length) {
        return res.status(404).json({
          success: false,
          message: `No curricula found for program '${program}' in ${semester} semester of ${year}`,
        });
      }
  
      res.status(200).json({
        success: true,
        data: filteredCurricula,
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
      const { id } = req.params; // Assuming the ID is passed as a URL parameter (e.g., /curriculums/:id)
      const data = req.body;

      // Find and update the curriculum by ID, return the updated document
      const updatedCurriculum = await Curriculum.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true } // new: true returns the updated document, runValidators ensures schema validation
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

      // Validate input
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of course group IDs' });
      }
      if (typeof archived !== 'boolean') {
        return res.status(400).json({ message: 'Archived status must be a boolean' });
      }
      if (!updated_by) {
        return res.status(400).json({ message: 'Updated_by field is required' });
      }

      // Update multiple course groups
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

      // Check if any documents were modified
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