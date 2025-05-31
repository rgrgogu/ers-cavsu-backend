const mongoose = require('mongoose');
const Enrollment = require('../../registrar/enrollment/model'); // Adjust path to your enrollment model

const StudentController = {
    GetStudentsBySection: async (req, res) => {
        try {
            const { section_id, school_year, semester, course_doc_id } = req.query;

            // Validate semester
            if (!['first', 'second', 'third', 'midyear'].includes(semester)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid semester value'
                });
            }

            // Fetch enrollments
            const students = await Enrollment
                .find({
                    school_year, semester, enrolled_courses: {
                        $elemMatch: {
                            'details': course_doc_id,
                            'enrolled_by': { $ne: null },
                            'date_enrolled': { $ne: null }
                        }
                    }
                })
                .populate({
                    path: 'student_id',
                    select: 'name user_id school_email profile_id_one',
                    populate: {
                        path: 'profile_id_one',
                        select: 'student_details applicant_profile'
                    }
                })
                .populate({
                    path: "section_id",
                    select: "section_code",
                })
                .exec();

            // Sort students by student_id.lastname (you may need to adjust depending on structure)
            students.sort((a, b) => {
                const lastA = a.student_id?.name?.lastname || '';
                const lastB = b.student_id?.name?.lastname || '';
                return lastA.localeCompare(lastB);
            });

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
