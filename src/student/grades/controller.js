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
};

module.exports = GradeController;