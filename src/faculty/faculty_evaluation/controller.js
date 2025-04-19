const mongoose = require("mongoose");
const Evaluation = require("../../student/faculty_evaluation/model"); // Import the Evaluation model


// Fetch evaluations for a student
exports.getEvaluationsByStudent = async (req, res) => {
    try {
        const { faculty_id, school_year, semester } = req.query;
        const query = { faculty_id };
        if (school_year) query.school_year = school_year;
        if (semester) query.semester = semester;

        // Fetch evaluations
        const evaluations = await Evaluation.find(query)
            .populate("course_id", "courseTitle courseCode")
            .populate("faculty_id", "name")
            .populate("school_year", "year")
            .populate({
                path: 'groups_id.id',
                select: 'title',
                model: 'eval_ctgy_groups'
            })
            .populate({
                path: 'groups_id.ratings.question_id',
                select: 'question',
                model: 'eval_ctgy_question'
            });

        res.status(200).json({
            message: "Evaluations retrieved successfully",
            evaluations
        });
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ error: "Server error while fetching evaluations" });
    }
};

