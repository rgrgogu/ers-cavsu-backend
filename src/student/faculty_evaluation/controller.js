const mongoose = require("mongoose");
const Evaluation = require("./model"); // Import the Evaluation model
// const Category = mongoose.model("Category"); // Assume Category model exists
// const Question = mongoose.model("Question"); // Assume Question model exists
// const Course = mongoose.model("Course"); // Assume Course model exists
// const Faculty = mongoose.model("Faculty"); // Assume Faculty model exists
// const SchoolYear = mongoose.model("SchoolYear"); // Assume SchoolYear model exists

// Create a new evaluation
exports.createEvaluation = async (req, res) => {
    try {
        const {
            course_id,
            faculty_id,
            school_year,
            semester,
            groups_id, // Now contains id, title, and ratings
            comments,
            isCompleted
        } = req.body;
        const id = req.query.id; // student_id
        console.log("Student ID:", req.body);
        // Validate semester
        const validSemesters = ['first', 'second', 'third', 'midyear'];
        if (!validSemesters.includes(semester)) {
            return res.status(400).json({ error: "Invalid semester value" });
        }

        // Create evaluation
        const evaluation = new Evaluation({
            student_id: id,
            course_id,
            faculty_id,
            school_year,
            semester,
            groups_id, // Now includes nested ratings
            comments: comments || "",
            isCompleted: isCompleted || false
        });

        await evaluation.save();

        // Populate references for response
        const populatedEvaluation = await Evaluation.findById(evaluation._id)
            .populate("course_id", "courseTitle courseCode")
            .populate("faculty_id", "name") // Adjusted to avoid 'name' issue
            .populate("school_year", "year")
            .populate("groups_id", "title"); // Populate the group id reference

        if (!populatedEvaluation.faculty_id) {
            return res.status(404).json({ error: "Faculty data not found for the provided faculty_id" });
        }

        res.status(201).json({
            message: "Evaluation created successfully",
            evaluation: populatedEvaluation
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: "Evaluation already exists for this course, faculty, and semester" });
        }
        console.error("Error creating evaluation:", error);
        res.status(500).json({ error: "Server error while creating evaluation" });
    }
};

// Fetch evaluations for a student
exports.getEvaluationsByStudent = async (req, res) => {
    try {
        const { student_id, school_year, semester } = req.query;
        console.log("Student ID:", req.query);
        const query = { student_id };
        if (school_year) query.school_year = school_year;
        if (semester) query.semester = semester;

        // Fetch evaluations
        const evaluations = await Evaluation.find(query)
            .populate("course_id", "courseTitle courseCode")
            .populate("faculty_id", "name")
            .populate("school_year", "year")
            .populate("groups_id", "title")
            .lean();

        res.status(200).json({
            message: "Evaluations retrieved successfully",
            evaluations
        });
    } catch (error) {
        console.error("Error fetching evaluations:", error);
        res.status(500).json({ error: "Server error while fetching evaluations" });
    }
};

