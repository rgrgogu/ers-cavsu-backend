const Enrollment = require('./model'); // Adjust the path as needed
const mongoose = require('mongoose');

// Mock models for population (replace with actual paths if different)
// const Course = require('../course/course.model'); // Adjust path
// const Faculty = require('../faculty/model'); // Adjust path
// const Evaluation = require('../evaluation/model'); // Adjust path

const enrollmentController = {
  // @desc    Get all enrollments
  // @route   GET /api/enrollments
  // @access  Private
  getEnrollments: async (req, res) => {
    try {
      const { student, school_year } = req.query;

      const query = { };
      if (student) query.student = mongoose.Types.ObjectId(student);
      if (school_year) query.school_year = mongoose.Types.ObjectId(school_year);

      const enrollments = await Enrollment.find(query)
        .populate('student', 'name email')
        .populate('school_year', 'year')
        .populate('curriculum_id', 'name')
        .populate('updated_by', 'name')
        .populate({
          path: 'checklist.years.semesters.first.course_id checklist.years.semesters.second.course_id checklist.years.semesters.third.course_id checklist.years.semesters.midyear.course_id',
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
          match: { isArchived: false }
        })
        .populate({
          path: 'checklist.years.semesters.first.faculty_id checklist.years.semesters.second.faculty_id checklist.years.semesters.third.faculty_id checklist.years.semesters.midyear.faculty_id',
          select: 'name email'
        })
        .populate({
          path: 'checklist.years.semesters.first.eval checklist.years.semesters.second.eval checklist.years.semesters.third.eval checklist.years.semesters.midyear.eval',
          select: 'rating comments'
        })
        .select('student school_year curriculum_id checklist updated_by isArchived updatedAt')
        .sort('createdAt')
        .lean()

      if (!enrollments || enrollments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No enrollments found matching the criteria'
        });
      }

      res.status(200).json(enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(400).json({
        success: false,
        message: 'Server error while fetching enrollments',
        error: error.message
      });
    }
  },

  // @desc    Get enrollments by criteria (e.g., student, school year)
  // @route   GET /api/enrollments/get_enrollments
  // @access  Private
  getEnrollmentsByCriteria: async (req, res) => {
    try {
      const { student, school_year } = req.query;

      const query = {};
      if (student) query.student = mongoose.Types.ObjectId(student);
      if (school_year) query.school_year = mongoose.Types.ObjectId(school_year);

      const enrollments = await Enrollment.find(query)
        .populate('student', 'name email')
        .populate('school_year', 'year')
        .populate('curriculum_id', 'name')
        .populate('updated_by', 'name')
        .populate({
          path: 'checklist.years.semesters.first.course_id checklist.years.semesters.second.course_id checklist.years.semesters.third.course_id checklist.years.semesters.midyear.course_id',
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
          match: { isArchived: false }
        })
        .populate({
          path: 'checklist.years.semesters.first.faculty_id checklist.years.semesters.second.faculty_id checklist.years.semesters.third.faculty_id checklist.years.semesters.midyear.faculty_id',
          select: 'name email'
        })
        .populate({
          path: 'checklist.years.semesters.first.eval checklist.years.semesters.second.eval checklist.years.semesters.third.eval checklist.years.semesters.midyear.eval',
          select: 'rating comments'
        })
        .lean();

      if (!enrollments.length) {
        return res.status(404).json({
          success: false,
          message: 'No enrollments found for the given criteria'
        });
      }

      res.status(200).json(enrollments);
    } catch (error) {
      console.error('Error fetching enrollments by criteria:', error);
      res.status(400).json({
        success: false,
        message: 'Server error while fetching enrollments',
        error: error.message
      });
    }
  },

  // @desc    Get single enrollment by ID
  // @route   GET /api/enrollments/:id
  // @access  Private
  getEnrollment: async (req, res) => {
    try {
      const id = req.params.id;

      const result = await Enrollment.findById(id)
        .populate({
          path: 'checklist.years.semesters.first.course_id checklist.years.semesters.second.course_id checklist.years.semesters.third.course_id checklist.years.semesters.midyear.course_id',
          select: 'courseCode courseTitle lectureCredits labCredits lectureContact labContact',
          match: { isArchived: false }
        })
        .populate({
          path: 'checklist.years.semesters.first.faculty_id checklist.years.semesters.second.faculty_id checklist.years.semesters.third.faculty_id checklist.years.semesters.midyear.faculty_id',
          select: 'name email'
        })
        .populate({
          path: 'checklist.years.semesters.first.eval checklist.years.semesters.second.eval checklist.years.semesters.third.eval checklist.years.semesters.midyear.eval',
          select: 'rating comments'
        })
        .populate('student', 'name email')
        .populate('school_year', 'year')
        .populate('curriculum_id', 'name')
        .populate('updated_by', 'name')
        .lean();

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching enrollment',
        error: error.message
      });
    }
  },

  // @desc    Create a new enrollment
  // @route   POST /api/enrollments
  // @access  Private
  mass_enroll_firstyear: async (req, res) => {
    try {
      const enrollmentData = req.body; // Expecting an array of enrollment objects
  
      // Validate that we have data to process
      if (!Array.isArray(enrollmentData) || enrollmentData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No enrollment data provided or invalid format. Expected an array of enrollments.',
        });
      }
  
      // Prepare bulk operations
      const bulkOperations = enrollmentData.map((data) => ({
        insertOne: {
          document: {
            student: data.student,
            curriculum_id: data.curriculum_id,
            checklist: data.checklist.map((yearData) => ({
              school_year: yearData.school_year,
              year: yearData.year, // Ensure this is "1st Year" or filter accordingly
              semesters: {
                first: yearData.semesters.first.map((course) => ({
                  course_id: course.course_id,
                  schedule_id: course.schedule_id || null, // Default to null if not provided
                  faculty_id: course.faculty_id || null, // Default to null if not provided
                  grade: course.grade || null, // Default to null if not provided
                  eval: course.eval || null, // Default to null if not provided
                  status: course.status || 'Enlisted', // Default to 'Enlisted' if not provided
                })),
                second: yearData.semesters.second || [],
                third: yearData.semesters.third || [],
                midyear: yearData.semesters.midyear || [],
              },
            })),
            updated_by: data.updated_by,
          },
        },
      }));
  
      // Filter to ensure only first-year enrollments (optional, depending on your logic)
      const firstYearOperations = bulkOperations.filter((op) =>
        op.insertOne.document.checklist.some((year) => year.year === "1st Year")
      );
  
      if (firstYearOperations.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No first-year enrollments found in the provided data.',
        });
      }
  
      // Perform bulk write
      const result = await Enrollment.bulkWrite(firstYearOperations);
  
      res.status(201).json({
        success: true,
        message: `Successfully enrolled ${result.insertedCount} first-year students.`,
        data: result,
      });
  
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error performing mass enrollment for first-year students',
        error: error.message,
      });
    }
  },

  // @desc    Update enrollment
  // @route   PUT /api/enrollments/:id
  // @access  Private
  updateEnrollment: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const updatedEnrollment = await Enrollment.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );

      if (!updatedEnrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      res.status(200).json(updatedEnrollment);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating enrollment',
        error: error.message
      });
    }
  },

  // @desc    Add subject to a specific semester and year in checklist
  // @route   PUT /api/enrollments/add-subject/:id
  // @access  Private
  addSubjectToChecklist: async (req, res) => {
    try {
      const { id } = req.params;
      const { yearIndex, semester, course_id, schedule_id, faculty_id, grade, eval, status } = req.body;

      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (!enrollment.checklist[yearIndex]) {
        enrollment.checklist.push({ year: '', semesters: { first: [], second: [], third: [], midyear: [] } });
      }

      const semesterField = enrollment.checklist[yearIndex].semesters[semester];
      if (!semesterField) {
        return res.status(400).json({
          success: false,
          message: 'Invalid semester'
        });
      }

      semesterField.push({
        course_id,
        schedule_id,
        faculty_id,
        grade,
        eval,
        status
      });

      const updatedEnrollment = await enrollment.save();
      res.status(200).json(updatedEnrollment);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error adding subject to checklist',
        error: error.message
      });
    }
  },

  // @desc    Update subject status in checklist
  // @route   PUT /api/enrollments/update-subject-status/:id
  // @access  Private
  updateSubjectStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { yearIndex, semester, subjectIndex, status } = req.body;

      const enrollment = await Enrollment.findById(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      if (!enrollment.checklist[yearIndex] || !enrollment.checklist[yearIndex].semesters[semester] || !enrollment.checklist[yearIndex].semesters[semester][subjectIndex]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid year, semester, or subject index'
        });
      }

      if (!['Enrolled', 'Enlisted'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      enrollment.checklist[yearIndex].semesters[semester][subjectIndex].status = status;
      const updatedEnrollment = await enrollment.save();
      res.status(200).json(updatedEnrollment);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating subject status',
        error: error.message
      });
    }
  },
};

module.exports = enrollmentController;