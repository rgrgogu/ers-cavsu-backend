const Grades = require("./model")
const Checklist = require("../../registrar/checklist/model")
const mongoose = require('mongoose')

const obj = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year'
}

const DetermineGradeStatus = (grade) => {
    const failingGrades = ['5.00', 'DRP'];
    return failingGrades.includes(grade) ? 'Failed' : 'Passed';
}

const GradeController = {
    MassUploadGrades: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { section_id, faculty_id, school_year, semester, course_id, student_grades } = req.body;

            // Step 1: Create grade documents
            const gradeOps = student_grades.map((entry) => ({
                updateOne: {
                    filter: {
                        student_id: entry.student_id,
                        course_id: course_id,
                        semester,
                        school_year: school_year,
                    },
                    update: {
                        $set: {
                            section_id: section_id,
                            faculty_id: faculty_id,
                            grade: entry.grade,
                            year_level: obj[entry.year_level],
                            grade_status: DetermineGradeStatus(entry.grade),
                            updatedAt: new Date(),
                        },
                        $setOnInsert: {
                            createdAt: new Date(),
                        },
                    },
                    upsert: true,
                },
            }));

            const gradeResult = await Grades.bulkWrite(gradeOps, { session });
            // Collect grade IDs (for new inserts and existing updates)
            const gradeIds = await Promise.all(
                student_grades.map(async (entry) => {
                    const gradeDoc = await Grades.findOne(
                        {
                            student_id: entry.student_id,
                            course_id: course_id,
                            semester,
                            school_year: school_year,
                        },
                        { _id: 1 },
                        { session }
                    );
                    return gradeDoc._id;
                })
            );

            if (gradeIds.length !== student_grades.length) {
                throw new Error('Failed to retrieve all grade document IDs');
            }

            const courseObjectId = new mongoose.Types.ObjectId(course_id);

            // Step 2: Prepare checklist updates using year and semester
            const checklistOps = student_grades.map((entry, index) => {
                const gradeId = gradeIds[index];
                return {
                    updateOne: {
                        filter: {
                            student_id: entry.student_id,
                            'years.year': obj[entry.year_level],
                        },
                        update: {
                            $set: {
                                [`years.$.semesters.${semester}.$[course].grade_id`]: gradeId,
                            },
                        },
                        arrayFilters: [{ 'course.course_id': courseObjectId }],
                    },
                };
            });

            // Step 3: Execute checklist updates
            const checklistResult = await Checklist.bulkWrite(checklistOps, { session });

            // Verify updates
            const matchedCount = checklistResult.matchedCount;

            if (matchedCount < student_grades.length) {
                throw new Error(`Only matched ${matchedCount} checklists, expected ${student_grades.length}`);
            }

            // Commit the transaction
            await session.commitTransaction();

            return res.status(200).json({
                message: 'Grades uploaded and checklists updated successfully',
            });
        } catch (error) {
            // Abort the transaction on error
            await session.abortTransaction();

            console.error('MassUploadGrades Error:', error);
            return res.status(500).json({
                message: 'Failed to upload grades',
                error: error.message,
            });
        } finally {
            session.endSession();
        }
    },

    GetStudentGrades: async (req, res) => {
        try {
            const { section_id, course_doc_id, school_year, semester } = req.query;

            // Validate required query parameters
            if (!section_id || !course_doc_id || !school_year || !semester) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required query parameters: section_id, course_doc_id, school_year, semester'
                });
            }

            // Validate ObjectId format
            if (!mongoose.Types.ObjectId.isValid(section_id) ||
                !mongoose.Types.ObjectId.isValid(course_doc_id) ||
                !mongoose.Types.ObjectId.isValid(school_year)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ObjectId format for section_id, course_doc_id, or school_year'
                });
            }

            // Validate semester
            const validSemesters = ['first', 'second', 'third', 'midyear'];
            if (!validSemesters.includes(semester)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid semester value'
                });
            }

            // Fetch grades with populated student information
            const grades = await Grades.find({
                section_id,
                course_id: course_doc_id,
                school_year,
                semester
            }).populate({
                path: 'student_id',
                select: 'user_id',
            }).lean();

            // Format response to match the expected structure in list.jsx
            const formattedGrades = grades.map(grade => ({
                user_id: grade.student_id?.user_id,
                grade: grade.grade,
                grade_status: grade.grade_status,
                year_level: grade.year_level
            }));

            return res.status(200).json({
                success: true,
                data: formattedGrades
            });
        } catch (error) {
            console.error('Error fetching grades:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}

module.exports = GradeController