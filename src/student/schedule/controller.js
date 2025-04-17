const mongoose = require('mongoose');
const EnrollmentDetails = require('../../registrar/enrollment_details/model'); // Adjust path

const EnrollmentDetailsController = {
    GetCoursesByStudent: async (req, res) => {
        try {
            const { section_id, school_year, semester } = req.query;

            const courses = await EnrollmentDetails
                .find({ section_id, school_year, semester })
                .populate('course_id', 'courseCode courseTitle credits')
                .populate('section_id', 'name')
                .populate({
                    path: 'faculty_id',
                    select: 'name '
                })
                .populate({
                    path: "schedule_id",
                    select: "day_time",
                    populate: {
                        path: "day_time.room",
                        select: "name"
                    },
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