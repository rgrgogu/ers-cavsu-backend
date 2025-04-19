const mongoose = require('mongoose');
const Enrollment = require('../../registrar/enrollment/model'); // Adjust path to your enrollment model

const EnrollmentController = {
  // Get enrollments for a specific student by student_id (using query parameter)
  GetEnrollmentByStudentId: async (req, res) => {
    try {
      const { student_id, school_year, semester } = req.query;

      // Validate student_id
      if (!student_id) {
        return res.status(400).json({
          success: false,
          message: 'student_id is required in query parameters'
        });
      }
      if (!mongoose.Types.ObjectId.isValid(student_id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student_id'
        });
      }

      // Build query
      const query = { student_id };
      if (school_year) query.school_year = school_year;
      if (semester) query.semester = semester;

      // Fetch enrollments with populated references
      const enrollments = await Enrollment.findOne(query)
        .populate({
          path: 'student_id',
          select: 'name profile_id_one user_id',
          populate: {
            path: 'profile_id_one',
            select: 'application_details student_details'
          }
        })
        .populate('enrolled_courses.details', 'course_id')
        .populate('enrolled_courses.enlisted_by', 'name')
        .populate('enrolled_courses.enrolled_by', 'name')
        .populate('section_id', 'section_code')
        .populate('school_year', 'year');

      if (!enrollments || enrollments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No enrollments found for this student'
        });
      }

      return res.status(200).json({
        success: true,
        data: enrollments,
        message: `Retrieved ${enrollments.length} enrollments for student`
      });
    } catch (error) {
      console.error('Error in GetEnrollmentByStudentId:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollments for student',
        error: error.message
      });
    }
  },

};

module.exports = EnrollmentController;