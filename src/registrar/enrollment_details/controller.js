const mongoose = require('mongoose');
const EnrollmentDetails = require('./model'); // Adjust path to your enrollment model

const EnrollmentDetailsController = {
    MassCreateEnlistmentDetails: async (courses, school_year, semester = 'first', user, section_id, session) => {
        try {
            // Quick input checks
            if (!Array.isArray(courses) || courses.length === 0) throw new Error('Courses must be a non-empty array');

            // Extract course_ids and prepare result array
            const courseIds = courses.map(course => {
                if (!course.course_id || typeof course.course_id !== 'string') {
                    throw new Error('Invalid course_id');
                }
                return course.course_id;
            });

            // Single query to find existing records
            const existing = await EnrollmentDetails.find({
                course_id: { $in: courseIds },
                section_id,
                semester,
                school_year
            })
                .select('_id course_id')
                .lean()
                .exec();

            // Use Set for O(1) lookups
            const existingIds = new Set(existing.map(doc => doc.course_id.toString()));
            const idMap = Object.fromEntries(existing.map(doc => [doc.course_id, doc._id]));

            // Prepare bulk operations and result IDs in one pass
            const bulkOps = [];
            const resultIds = courseIds.map(courseId => {
                if (existingIds.has(courseId)) {
                    return idMap[courseId]; // Return existing _id
                }

                const _id = new mongoose.Types.ObjectId();
                bulkOps.push({
                    insertOne: {
                        document: {
                            _id,
                            course_id: courseId,
                            pre_req_ids: courses.find(c => c.course_id === courseId)?.pre_req_ids || [],
                            pre_req_strings: courses.find(c => c.course_id === courseId)?.pre_req_strings || [],
                            section_id,
                            semester,
                            school_year,
                            created_by: user,
                            updated_by: user
                        }
                    }
                });
                return _id;
            });

            // Execute bulkWrite only if needed
            if (bulkOps.length > 0) {
                await EnrollmentDetails.bulkWrite(bulkOps, { session }); // Unordered for speed
            }

            return resultIds;
        } catch (error) {
            console.error('Error in MassCreateEnlistmentDetails:', error);
            throw error;
        }
    }
};

module.exports = EnrollmentDetailsController;