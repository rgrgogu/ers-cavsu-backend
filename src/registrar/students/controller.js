const Student = require("../../auth/login/model")
const Checklist = require("../checklist/model")
const Enrollment = require("../enrollment/model")
const mongoose = require('mongoose')
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

            const filteredStudents = students.filter(student => student.profile_id_one?.enrollment_id !== null);

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
                    select: 'grade grade_status',
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
        const { year, semester } = req.query;
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
            const courses = semesterData.map(course => {
                let canEnlist = true;

                // Check if the course has prerequisites
                if (course.pre_req_ids && course.pre_req_ids.length > 0) {
                    for (const preReqId of course.pre_req_ids) {
                        // Find the prerequisite course in any semester of the same year
                        const preReqCourse = allSemCourses.find(semCourse =>
                            semCourse.course_id && semCourse.course_id.equals(preReqId)
                        );

                        // If prerequisite course or its grade is missing, or grade_status is not 'Passed', cannot enlist
                        if (!preReqCourse || !preReqCourse.grade_id || preReqCourse.grade_id.grade_status !== 'Passed') {
                            canEnlist = false;
                            break;
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
            });

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

            res.json(semesterData);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
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
}

module.exports = StudentController;