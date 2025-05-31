const mongoose = require('mongoose');
const EnrollmentDetails = require('../../registrar/enrollment_details/model'); // Adjust path

const EnrollmentDetailsController = {
    GetCoursesByFaculty: async (req, res) => {
        try {
            const { faculty_id, school_year, semester } = req.query;

            const courses = await EnrollmentDetails
                .find({ faculty_id, school_year, semester })
                .populate('course_id', 'courseCode courseTitle credits')
                .populate('faculty_id', 'name')
                .populate({
                    path: 'enrolled_count',
                    select: 'user_id name school_email profile_id_one',
                    populate: {
                        path: 'profile_id_one',
                        select: 'student_details',
                        populate: {
                            path: 'student_details'
                        }
                    }
                })
                .populate({
                    path: "schedule_id",
                    select: "day_time",
                    populate: {
                        path: "day_time.room",
                        select: "name"
                    },
                })
                .populate({
                    path: "section_id",
                    select: "section_code enrolled_count",
                })
                .exec();

            if (!courses.length) {
                return res.status(404).json({
                    success: false,
                    message: 'No courses found for the specified criteria'
                });
            }

            res.status(200).json({
                success: true,
                data: courses
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Error fetching courses: ${error.message}`
            });
        }
    },
};

module.exports = EnrollmentDetailsController;