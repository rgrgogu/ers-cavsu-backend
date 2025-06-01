const Student = require("../../auth/login/model")
const Checklist = require("../checklist/model")
const Enrollment = require("../enrollment/model")
const EnrollmentDetails = require("../enrollment_details/model")
const mongoose = require('mongoose')

function hasCompletedYearStanding(current_yearLevel, yearLevel) {
    console.log(`Checking if current year level ${current_yearLevel} matches required year level ${yearLevel}`);
    return parseInt(current_yearLevel) === yearLevel;
}

function hasCompletedFirstAndSecondYearStanding(checklistYears) {
    const targetYears = ["1st Year", "2nd Year"];

    for (const year of checklistYears) {
        if (targetYears.includes(year.year)) {
            const semesters = year.semesters;
            for (const semKey in semesters) {
                const semCourses = semesters[semKey];
                if (Array.isArray(semCourses)) {
                    for (const course of semCourses) {
                        const passed = course.grade_id?.grade_status === 'Passed';
                        if (!passed) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
}

function hasTaken70PercentUnits(courses, grandTotalUnits) {
    let passedUnits = 0;

    courses.forEach(c => {
        const credits = c.course_id?.credits || 0;
        if (c.grade_id?.grade_status === 'Passed') {
            passedUnits += credits;
        }
    });

    console.log(`Total passed units: ${passedUnits}, Grand total units: ${grandTotalUnits}`);

    return grandTotalUnits > 0 && (passedUnits / grandTotalUnits) >= 0.7;
}

function hasPassedAllSubjects(courses) {
    return courses.every(c => c.grade_id && c.grade_id.grade_status === 'Passed');
}

function hasPassedAllMajorSubjects(courses) {
    return courses.every(c => {
        if (!c.course_id || !c.course_id.isMajor) return true; // Non-major courses are ignored
        return c.grade_id && c.grade_id.grade_status === 'Passed';
    });
}

function CheckPreRequisites(course, yearLevel, allSemCourses, checklist) {
    let canEnlist = true;

    const hardcodedValues = [
        "2nd Year Standing",
        "3rd Year Standing",
        "4th Year Standing",
        "70% total units taken",
        "All Major Subjects",
        "All Subjects",
        "All 1st and 2nd Year Courses",
        "Incoming 4th Year"
    ];

    // Handle pre_req_ids
    if (course.pre_req_ids && course.pre_req_ids.length > 0) {
        for (const preReqId of course.pre_req_ids) {
            const preReqCourse = allSemCourses.find(semCourse =>
                semCourse.course_id && semCourse.course_id.equals(preReqId)
            );

            if (!preReqCourse || !preReqCourse.grade_id || preReqCourse.grade_id.grade_status !== 'Passed') {
                canEnlist = false;
                break;
            }
        }
    }

    // Handle pre_req_strings (hardcoded prerequisites)
    if (course.pre_req_strings && course.pre_req_strings.length > 0) {
        for (const req of course.pre_req_strings) {
            if (hardcodedValues.includes(req)) {
                switch (req) {
                    case "2nd Year Standing":
                        if (!hasCompletedYearStanding(yearLevel.charAt(0), 2)) canEnlist = false;
                        break;
                    case "3rd Year Standing":
                        if (!hasCompletedYearStanding(yearLevel.charAt(0), 3)) canEnlist = false;
                        break;
                    case "4th Year Standing":
                    case "Incoming 4th Year":
                        if (!hasCompletedYearStanding(yearLevel.charAt(0), 4)) canEnlist = false;
                        break;
                    case "70% total units taken":
                        if (!hasTaken70PercentUnits(allSemCourses, checklist.total_units)) canEnlist = false;
                        break;
                    case "All Subjects":
                        if (!hasPassedAllSubjects(allSemCourses)) canEnlist = false;
                        break;
                    case "All Major Subjects":
                        if (!hasPassedAllMajorSubjects(allSemCourses)) canEnlist = false;
                        break;
                    case "All 1st and 2nd Year Courses":
                        if (!hasCompletedFirstAndSecondYearStanding(checklist.years)) canEnlist = false;
                        break;
                    default:
                        break;
                }

                // if (!canEnlist) break; // Stop early if any string condition fails
            }
        }
    }

    return {
        course_id: course.course_id,
        pre_req_ids: course.pre_req_ids,
        pre_req_strings: course.pre_req_strings,
        grade_id: course.grade_id,
        eval_id: course.eval_id,
        canEnlist,
    };
}

const StudentController = {
    // List all Students
    get_new_firstyear: async (req, res) => {
        try {
            const students = await Student.find({ isArchived: false, role: "student" })
                .populate('profile_id_one', 'application_details student_details')
                .select("-password")
                .sort({ user_id: 1 });

            const filteredStudents = students.filter(student => {
                const details = student.profile_id_one?.student_details;
                return (
                    details?.student_type === "New" &&
                    details?.student_status === "Regular" &&
                    details?.year_level === 1 &&
                    !details?.enrollment_id
                );
            });

            res.json(filteredStudents);
        } catch (error) {
            res.status(400).json({ message: "Error fetching students", error: error.message });
        }
    },

    get_old_students: async (req, res) => {
        try {
            const students = await Student.find({ isArchived: false, role: "student" })
                .populate('profile_id_one', 'application_details student_details')
                .select("-password")
                .sort({ user_id: 1 });

            const filteredStudents = students.filter(student => {
                const profile = student.profile_id_one;
                return profile?.enrollment_id !== null || profile?.student_details?.student_type === "Old";
            });

            res.json(filteredStudents);
        } catch (error) {
            res.status(400).json({ message: "Error fetching students", error: error.message });
        }
    },

    get_all_students: async (req, res) => {
        try {
            const students = await Student.find({ isArchived: false, role: "student" })
                .populate('profile_id_one', 'application_details student_details applicant_profile')
                .select("-password")
                .sort({ user_id: 1 });

            res.json(students);
        } catch (error) {
            res.status(400).json({ message: "Error fetching students", error: error.message });
        }
    },

    get_checklist_by_student: async (req, res) => {
        try {
            const student_doc_id = req.params.id

            const result = await Checklist.findOne({ student_id: student_doc_id })
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
                    select: 'grade grade_status semester',
                    populate: {
                        path: "school_year",
                        select: "year"
                    }
                })
                .populate({
                    path: 'program',
                    select: 'name',
                })
                .lean();

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Checklist not found',
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error fetching checklist',
                error: error.message,
            });
        }
    },

    get_checklist_by_student_sem: async (req, res) => {
        const { year, semester, school_year } = req.query;
        const student_id = req.params.id;

        try {
            // Validate semester
            // if (semester !== 'second') {
            //     return res.status(400).json({ message: 'This endpoint only supports second semester checks' });
            // }

            // Fetch checklist with all relevant populations
            const checklist = await Checklist.findOne({ student_id })
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
                    select: 'grade grade_status',
                })
                .populate({
                    path: 'program',
                    select: 'name',
                });

            if (!checklist) {
                return res.status(404).json({ message: 'Checklist not found' });
            }

            // Find the specific year level
            const yearData = checklist.years.find(y => y.year === year);
            if (!yearData) {
                return res.status(404).json({ message: `Year '${year}' not found` });
            }

            // Get the semester data
            const semesterData = yearData.semesters[semester];
            if (!semesterData) {
                return res.status(404).json({ message: `Semester '${semester}' not found` });
            }

            // Collect all courses with grade_id from all semesters in the same year
            const allSemCourses = [];

            checklist.years.forEach(year => {
                ['first', 'second', 'third', 'midyear'].forEach(sem => {
                    const semData = year.semesters[sem];
                    if (semData && Array.isArray(semData)) {
                        semData.forEach(course => {
                            if (course.grade_id) {
                                allSemCourses.push(course);
                            }
                        });
                    }
                });
            });

            const studentStatus = allSemCourses.some(semCourse => semCourse.grade_id?.grade_status === 'Failed')
                ? "Irregular"
                : "Regular";

            // Map through second semester courses and determine canEnlist for each
            const courses = await Promise.all(semesterData.map(async (course) => {
                const courseWithPrereqs = CheckPreRequisites(course, year, allSemCourses, checklist);

                // Fetch schedule(s) for this course
                const schedules = await EnrollmentDetails.find({
                    course_id: course.course_id,
                    semester,
                    school_year
                }).populate({
                    path: "schedule_id",
                    select: "day_time",
                    populate: {
                        path: "day_time.room",
                        select: "name"
                    }
                }).select("schedule_id");

                // Format schedule display string
                const scheduleDisplay = schedules.flatMap(s =>
                    (s.schedule_id?.day_time || []).map(dt =>
                        `${dt.day} ${dt.time}${dt.room?.name ? ` [${dt.room.name}]` : ''}`
                    )
                ).join(" / ") || "TBA";

                return {
                    ...courseWithPrereqs,
                    schedule: scheduleDisplay
                };
            }));

            // Prepare response
            const responseData = {
                courses,
                studentStatus,
            };

            res.json(responseData);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    get_gradeslip_by_sem_yrlvl: async (req, res) => {
        const { checklist_id, year, semester } = req.query;

        try {
            // Dynamically construct populate paths
            const coursePath = `years.semesters.${semester}.course_id`;
            const preReqPath = `years.semesters.${semester}.pre_req_ids`;
            const gradePath = `years.semesters.${semester}.grade_id`;

            const checklist = await Checklist.findById(checklist_id)
                .populate({
                    path: coursePath,
                    select: 'courseCode courseTitle credits',
                })
                .populate({
                    path: preReqPath,
                    select: 'courseCode',
                })
                .populate({
                    path: gradePath,
                    select: 'grade grade_status',
                })
                .populate({
                    path: 'program',
                    select: 'name',
                });

            if (!checklist) {
                return res.status(404).json({ message: 'Checklist not found' });
            }

            // Find the specific year level
            const yearData = checklist.years.find(y => y.year === year);
            if (!yearData) {
                return res.status(404).json({ message: `Year '${year}' not found` });
            }

            // Get the semester data
            const semesterData = yearData.semesters[semester];
            if (!semesterData) {
                return res.status(404).json({ message: `Semester '${semester}' not found` });
            }

            // if (forChecklist === "true") {
            //     const allSemCourses = [];

            //     checklist.years.forEach(year => {
            //         ['first', 'second', 'third', 'midyear'].forEach(sem => {
            //             const semData = year.semesters[sem];
            //             if (semData && Array.isArray(semData)) {
            //                 semData.forEach(course => {
            //                     if (course.grade_id) {
            //                         console.log("course", course)
            //                         allSemCourses.push(course);
            //                     }
            //                 });
            //             }
            //         });
            //     });

            //     return res.status(200).json({allSemCourses, checklist});
            // }

            return res.status(200).json(semesterData);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    get_enrollment_by_student_id: async (req, res) => {
        try {
            const { student_id, school_year, semester } = req.query;

            // Build dynamic query
            const query = { student_id };
            if (school_year) query.school_year = school_year;
            if (semester) query.semester = semester;

            // Fetch enrollment with populated references
            const enrollment = await Enrollment.findOne(query)
                .populate({
                    path: 'enrolled_courses.details',
                    select: 'course_id schedule_id',
                    populate: [
                        {
                            path: 'course_id',
                            select: 'courseCode courseTitle credits'
                        },
                        {
                            path: 'schedule_id',
                            select: 'day_time',
                            populate: {
                                path: 'day_time.room',
                                select: 'name'
                            }
                        }
                    ]
                })
                .populate('section_id', 'section_code')
                .populate('school_year', 'year');

            if (!enrollment) {
                return res.status(404).json({
                    success: false,
                    message: 'No enrollment found for this student'
                });
            }

            return res.status(200).json(enrollment);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve enrollment for student',
                error: error.message
            });
        }
    },

    get_cors: async (req, res) => {
        try {
            const student_id = req.params.id

            if (!student_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing student_id in request'
                });
            }

            // Get all enrollment records for this student
            const enrollments = await Enrollment.find({ student_id })
                .populate({
                    path: 'enrolled_courses.details',
                    select: 'course_id schedule_id',
                    populate: [
                        {
                            path: 'course_id',
                            select: 'courseCode courseTitle credits'
                        },
                        {
                            path: 'schedule_id',
                            select: 'day_time',
                            populate: {
                                path: 'day_time.room',
                                select: 'name'
                            }
                        }
                    ]
                })
                .populate('section_id', 'section_code')
                .populate('school_year', 'year')
                .sort({ createdAt: -1 }); // Optional: sort most recent first

            if (!enrollments.length) {
                return res.status(404).json({
                    success: false,
                    message: 'No CORs found for this student'
                });
            }

            return res.status(200).json({
                success: true,
                data: enrollments
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve CORs',
                error: error.message
            });
        }
    },

    get_gradeslips: async (req, res) => {
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

module.exports = StudentController;