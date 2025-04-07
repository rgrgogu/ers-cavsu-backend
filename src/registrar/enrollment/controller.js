const mongoose = require('mongoose');

const Enrollment = require('./model'); 
const Student = require('../../auth/login/model'); 
const Section = require("../section/model")
const SchoolYear = require('../../admin/school_year/model');

const enrollmentController = {
  // @desc    Get all enrollments
  // @route   GET /api/enrollments
  // @access  Private
  getEnrollments: async (req, res) => {
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

  get_new_enrollment_firstyear: async (req, res) => {
    try {
      // Calculate the current academic year (e.g., "2024-2025")
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;
  
      // Find the school_year ObjectId based on the academic year
      const schoolYearDoc = await SchoolYear.findOne({ year: academicYear });
      if (!schoolYearDoc) {
        return res.status(404).json({
          message: `No school year found for ${academicYear}`,
        });
      }
      const schoolYearId = schoolYearDoc._id;
  
      // Query the enrollment with the matching school_year and year level "1st Year"
      const enrollment = await Enrollment.aggregate([
        { $match: { 'checklist.year': '1st Year' } },
        { $unwind: '$checklist' },
        { $match: { 'checklist.year': '1st Year', 'checklist.school_year': schoolYearId } },
        {
          $lookup: {
            from: 'stu_logins', // Adjusted to plural (check your actual collection name)
            localField: 'student',
            foreignField: '_id',
            as: 'student_details',
            pipeline: [ // Specify only attributes
              {
                $project: {
                  student_id: 1, // Include only student_id
                  name: 1,
                  student_type: 1,
                  student_status: 1,
                  program: 1,
                  _id: 1, // Exclude _id if not needed
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'sections', // Adjusted to match your collection name
            localField: 'section',
            foreignField: '_id',
            as: 'section_details',
            pipeline: [ // Specify only section_code
              {
                $project: {
                  section_code: 1, // Include only section_code
                  _id: 0, // Exclude _id if not needed
                },
              },
            ],
          },
        },
        {
          $project: {
            student: { $arrayElemAt: ['$student_details', 0] }, // Full student document
            section: { $arrayElemAt: ['$section_details', 0] }, // Only section_code
            updated_by: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);
  
      if (!enrollment.length) {
        return res.status(404).json({
          message: `No enrollment found for 1st Year and school year ${academicYear}`,
        });
      }
  
      return res.status(200).json({
        message: `Enrollment retrieved successfully for 1st Year and school year ${academicYear}`,
        data: enrollment,
      });
    } catch (error) {
      return res.status(400).json({
        message: 'Error retrieving enrollment',
        error: error.message,
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
      const studentIds = enrollmentData.map((item) => item.student); // Array of student IDs

      // Validate that we have data to process
      if (!Array.isArray(enrollmentData) || enrollmentData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No enrollment data provided or invalid format. Expected an array of enrollments.',
        });
      }

      // Prepare bulk operations for Enrollment collection
      const bulkEnrollmentOperations = enrollmentData.map((data) => ({
        insertOne: {
          document: {
            student: data.student,
            curriculum_id: data.curriculum_id,
            section: data.section, // Section ID from the enrollment data
            checklist: data.checklist.map((yearData) => ({
              school_year: yearData.school_year,
              year: yearData.year,
              semesters: {
                first: yearData.semesters.first.map((course) => ({
                  course_id: course.course_id,
                  schedule_id: course.schedule_id || null,
                  faculty_id: course.faculty_id || null,
                  grade: course.grade || null,
                  eval: course.eval || null,
                  status: course.status || 'Enlisted',
                  enlisted_by: course.enlisted_by || 'System',
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

      // Filter for first-year enrollments
      const firstYearOperations = bulkEnrollmentOperations.filter((op) =>
        op.insertOne.document.checklist.some((year) => year.year === "1st Year")
      );

      if (firstYearOperations.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No first-year enrollments found in the provided data.',
        });
      }

      // Perform bulk write to Enrollment collection
      const enrollmentResult = await Enrollment.bulkWrite(firstYearOperations);

      // Get the inserted enrollment IDs
      const insertedIds = Object.values(enrollmentResult.insertedIds);

      // Map student IDs to their corresponding enrollment IDs
      const studentUpdates = enrollmentData.map((data, index) => ({
        updateOne: {
          filter: { _id: data.student },
          update: { $set: { enrollment_id: insertedIds[index] } },
        },
      }));

      // Perform bulk update on Student collection
      const studentUpdateResult = await Student.bulkWrite(studentUpdates);

      // Aggregate sections to update enrolled count
      const sectionUpdates = {};
      enrollmentData.forEach((data) => {
        if (data.section) {
          sectionUpdates[data.section] = (sectionUpdates[data.section] || 0) + 1;
        }
      });

      // Prepare bulk operations for Section collection
      const bulkSectionOperations = Object.keys(sectionUpdates).map((sectionId) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(sectionId) },
          update: { $inc: { enrolled_count: sectionUpdates[sectionId] } }, // Increment enrolled count
        },
      }));

      // Perform bulk update on Section collection if there are updates
      let sectionUpdateResult = null;
      if (bulkSectionOperations.length > 0) {
        sectionUpdateResult = await Section.bulkWrite(bulkSectionOperations);
      }

      res.status(201).json({
        success: true,
        message: `Successfully enrolled ${enrollmentResult.insertedCount} first-year students, updated ${studentUpdateResult.modifiedCount} student records, and updated ${sectionUpdateResult ? sectionUpdateResult.modifiedCount : 0} section(s).`,
        data: {
          enrollments: enrollmentResult,
          studentUpdates: studentUpdateResult,
          sectionUpdates: sectionUpdateResult,
        },
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