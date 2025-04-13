const mongoose = require('mongoose');
const EnrollmentDetails = require('./model'); // Adjust path to your enrollment model
const ScheduleController = require("../schedules/controller")

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
    },

    GetCoursesBySection: async (req, res) => {
        try {
            const { section_id, school_year, semester } = req.query;

            // Validate required fields
            if (!section_id || !school_year || !semester) {
                return res.status(400).json({
                    success: false,
                    message: 'section_id, school_year, and semester are required'
                });
            }

            const courses = await EnrollmentDetails
                .find({ section_id, school_year, semester })
                .populate('course_id', 'courseCode courseTitle credits')
                .populate('faculty_id', 'name')
                .populate({
                    path: "schedule_id",
                    select: "day_time",
                    populate: {
                        path: "day_time.room",
                        select: "name"
                    }
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

    MassUpdateSchedules: async (req, res) => {
        const session = await mongoose.startSession();
        const { user, schedule } = req.body;

        try {
            session.startTransaction();

            const updates = [];

            for (const elem of schedule) {
                const item = elem.schedule
                const scheduleId = await ScheduleController.CreateSchedule(
                    item.school_year,
                    item.semester,
                    item.day_time,
                    session,
                    elem.schedule_id
                );

                updates.push({
                    updateOne: {
                        filter: { _id: elem.doc_id },
                        update: {
                            $set: {
                                schedule_id: scheduleId,
                                faculty_id: elem.faculty,
                                updated_by: user
                            }
                        }
                    }
                });
            }

            // Run bulk update
            if (updates.length > 0) {
                await EnrollmentDetails.bulkWrite(updates, { session });
            }

            await session.commitTransaction();
            session.endSession();

            return res.json({ success: true });
        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: err.message });
        }
    }
};

module.exports = EnrollmentDetailsController;