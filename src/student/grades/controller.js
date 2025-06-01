const Checklist = require("../../registrar/checklist/model");
const mongoose = require('mongoose');

const GradeController = {
    GetStudentGrade: async (req, res) => {
        try {
            const { student_id } = req.query;

            // Validate student_id
            if (!mongoose.Types.ObjectId.isValid(student_id)) {
                return res.status(400).json({ message: 'Invalid student_id' });
            }

            // Define semesters
            const semesters = ['first', 'second', 'third', 'midyear'];

            // Generate population paths for course_id and grade_id
            const populatePaths = semesters.flatMap(semester => [
                {
                    path: `years.semesters.${semester}.course_id`,
                    select: 'courseCode courseTitle credits'
                },
                {
                    path: `years.semesters.${semester}.grade_id`,
                    select: 'grade grade_status',
                    populate: [
                        {
                            path: 'faculty_id',
                            select: 'name'
                        },
                        {
                            path: 'section_id',
                            select: 'section_code'
                        }
                    ]
                }
            ]);

            const result = await Checklist.findOne(
                { student_id: student_id }, // Match student_id
                { years: 1 } // Project only the years field
            )
                .populate(populatePaths)
            // .lean();

            if (!result || !result.years || result.years.length === 0) {
                return res.status(404).json({ message: 'No data found for this student' });
            }

            // Process years and semesters to include semesters with at least one grade_id
            const filteredYears = result.years.reduce((acc, year) => {
                const filteredSemesters = {};

                for (const semester of semesters) {
                    const courses = year.semesters[semester];
                    if (courses && courses.some(course => course.grade_id)) {
                        filteredSemesters[semester] = courses; // Include all courses in the semester
                    }
                }

                // Include the year only if it has at least one qualifying semester
                if (Object.keys(filteredSemesters).length > 0) {
                    acc.push({
                        year: year.year,
                        semesters: filteredSemesters
                    });
                }

                return acc;
            }, []);

            if (filteredYears.length === 0) {
                return res.status(404).json({ message: 'No semesters with grades found' });
            }

            return res.json({
                years: filteredYears
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    get_gradeslip_by_sem_yrlvl: async (req, res) => {
        const { checklist_id, year, semester } = req.query;

        try {
            // Dynamically construct populate paths
            const coursePath = `years.semesters.${semester}.course_id`;
            const preReqPath = `years.semesters.${semester}.pre_req_ids`;
            const gradePath = `years.semesters.${semester}.grade_id`;

            // const checklist = await Checklist.findById(checklist_id)
            //     .populate({
            //         path: coursePath,
            //         select: 'courseCode courseTitle credits',
            //     })
            //     .populate({
            //         path: preReqPath,
            //         select: 'courseCode',
            //     })
            //     .populate({
            //         path: gradePath,
            //         select: 'grade grade_status',
            //     })
            //     .populate({
            //         path: 'program',
            //         select: 'name',
            //     });

            const checklist = await Checklist.findById(checklist_id)
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

            if (!checklist) {
                return res.status(404).json({ message: 'Checklist not found' });
            }

            const enrolledCoursesByYearAndSemester = {};

            checklist.years.forEach(yearEntry => {
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

            // // Find the specific year level
            // const yearData = checklist.years.find(y => y.year === year);
            // if (!yearData) {
            //     return res.status(404).json({ message: `Year '${year}' not found` });
            // }

            // // Get the semester data
            // const semesterData = yearData.semesters[semester];
            // if (!semesterData) {
            //     return res.status(404).json({ message: `Semester '${semester}' not found` });
            // }

            return res.json(enrolledCoursesByYearAndSemester);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
    },
};

module.exports = GradeController;