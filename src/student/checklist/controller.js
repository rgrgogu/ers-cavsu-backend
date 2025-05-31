const Curriculum = require('../../admin/curriculum/model');
const Checklist = require('../../registrar/checklist/model');

const ChecklistController = {
    GetChecklistForEnrollee: async (req, res) => {
        try {
            const student_id = req.params.id

            // const result = await Checklist.findOne({ student_id })
            //     .populate({
            //         path: 'years.semesters.first.course_id years.semesters.second.course_id years.semesters.third.course_id years.semesters.midyear.course_id',
            //         select: 'courseCode courseTitle credits',
            //     })
            //     .populate({
            //         path: 'years.semesters.first.pre_req_ids years.semesters.second.pre_req_ids years.semesters.third.pre_req_ids years.semesters.midyear.pre_req_ids',
            //         select: 'courseCode',
            //     })
            //     .populate({
            //         path: 'years.semesters.first.grade_id years.semesters.second.grade_id years.semesters.third.grade_id years.semesters.midyear.grade_id',
            //         select: 'grade grade_status school_year semester year_level section_id',
            //         populate: {
            //             path: 'section_id',
            //             select: 'section_code',
            //             path: 'school_year',
            //             select: 'year',
            //         }
            //     })
            //     .populate({
            //         path: 'program',
            //         select: 'name',
            //     })
            //     .lean();

            const result = await Checklist.findOne({ student_id })
                .populate({
                    path: 'years.semesters.first.course_id years.semesters.second.course_id years.semesters.third.course_id years.semesters.midyear.course_id',
                    select: 'courseCode courseTitle credits',
                })
                .populate({
                    path: 'years.semesters.first.pre_req_ids years.semesters.second.pre_req_ids years.semesters.third.pre_req_ids years.semesters.midyear.pre_req_ids',
                    select: 'courseCode',
                })
                .populate({
                    path: 'years.semesters.first.grade_id years.semesters.second.grade_id years.semesters.third.grade_id years.semesters.midyear.grade_id',
                    select: 'grade grade_status school_year semester year_level section_id',
                    populate: [
                        {
                            path: 'section_id',
                            select: 'section_code'
                        },
                        {
                            path: 'school_year',
                            select: 'year'
                        },
                        {
                            path: 'faculty_id',
                            select: 'name'
                        }
                    ],
                })
                .populate({
                    path: 'program',
                    select: 'name'
                })
                .lean();

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Curriculum not found',
                });
            }

            const enrolledCoursesByYearAndSemester = {};

            result.years.forEach(yearEntry => {
                const year = yearEntry.year;
                Object.entries(yearEntry.semesters).forEach(([semester, courses]) => {
                    courses.forEach(course => {
                        const grade = course.grade_id;
                        if (grade) {
                            const yrLvl = grade.year_level;
                            const sem = grade.semester;

                            if (!enrolledCoursesByYearAndSemester[yrLvl]) {
                                enrolledCoursesByYearAndSemester[yrLvl] = {};
                            }

                            if (!enrolledCoursesByYearAndSemester[yrLvl][sem]) {
                                enrolledCoursesByYearAndSemester[yrLvl][sem] = [];
                            }

                            enrolledCoursesByYearAndSemester[yrLvl][sem].push({
                                course_id: course.course_id,
                                grade: grade.grade,
                                grade_status: grade.grade_status,
                                section: grade.section_id?.section_code || null,
                                school_year: grade.school_year?.year || null,
                                eval_id: course.eval_id,
                                faculty: `${grade.faculty_id?.name?.lastname || ''}, ${grade.faculty_id?.name?.firstname || ''} ${grade.faculty_id?.name.middlename} ${grade.faculty_id?.name?.extension}`.trim()
                            });
                        }
                    });
                });
            });

            res.status(200).json({
                success: true,
                checklist: result,
                enrolled: enrolledCoursesByYearAndSemester
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error fetching checklist',
                error: error.message,
            });
        }
    },
}

module.exports = ChecklistController