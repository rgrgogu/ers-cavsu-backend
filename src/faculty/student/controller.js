const mongoose = require('mongoose');
const Enrollment = require('../../registrar/enrollment/model'); // Adjust path to your enrollment model

const StudentController = {
    GetStudentsBySection: async (req, res) => {
        try {
            const { section_id, school_year, semester } = req.query;
            console.log(section_id, school_year, semester);

            // Validate semester
            if (!['first', 'second', 'third', 'midyear'].includes(semester)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid semester value'
                });
            }

            // Fetch enrollments
            const students = await Enrollment
            .find({section_id,school_year,semester})
            .populate({
                path: 'student_id',
                select: 'name user_id school_email profile_id_one',
                options: { sort: { 'name.lastname': 1 } },
                populate:{
                    path: 'profile_id_one',
                    select: 'student_details applicant_profile'
                }
            })
            .populate({
                path: "section_id",
                select: "section_code",
            })
            .exec();

            return res.status(200).json({
                success: true,
                data: students,
                message: `Retrieved ${students.length} students for section ${section_id}`
            });
        } catch (error) {
            console.error('Error in GetStudentsBySection:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve students',
                error: error.message
            });
        }
    }
};

module.exports = StudentController;
