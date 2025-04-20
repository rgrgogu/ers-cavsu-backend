const mongoose = require('mongoose');
const EnrollmentDetails = require('../../registrar/enrollment_details/model'); // Adjust path

const EnrollmentDetailsController = {
    GetCoursesByStudent: async (req, res) => {
        try {
            const { section_id, course_ids, school_year, semester } = req.query;
    
            // Validate required query parameters
            if (!section_id || !course_ids || !school_year || !semester) {
                return res.status(400).json({
                    success: false,
                    message: 'course_ids, school_year, and semester are required in query parameters'
                });
            }
    
            // Parse course_ids (it might be a comma-separated string or an array)
            let courseIdArray;
            try {
                courseIdArray = Array.isArray(course_ids) ? course_ids : course_ids.split(',');
                // Validate each course_id as a valid ObjectId
                if (!courseIdArray.every(id => mongoose.Types.ObjectId.isValid(id))) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid course_id in course_ids'
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid course_ids format'
                });
            }
    
            // Query EnrollmentDetails using the list of course_ids
            const courses = await EnrollmentDetails
                .find({
                    section_id,
                    course_id: { $in: courseIdArray },
                    school_year,
                    semester
                })
                .populate('course_id', 'courseCode courseTitle credits')
                .populate('section_id', 'name')
                .populate({
                    path: 'faculty_id',
                    select: 'name'
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