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

            // Fetch enrollment with populated references
            const enrollment = await Enrollment.findOne({ student_id, school_year, semester })
                .populate({
                    path: 'enrolled_courses.details',
                    select: 'course_id schedule_id',
                    populate: [
                        {
                            path: 'course_id',
                            select: 'courseCode courseTitle credits' // Select specific fields from courses
                        },
                        {
                            path: 'schedule_id',
                            select: 'day_time', // Select day_time from schedules
                            populate: {
                                path: "day_time.room",
                                select: "name"
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