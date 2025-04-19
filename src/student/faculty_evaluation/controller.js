const mongoose = require("mongoose");
const Evaluation = require("./model"); // Import the Evaluation model
const Checklist = require("../../registrar/checklist/model")
// const Category = mongoose.model("Category"); // Assume Category model exists
// const Question = mongoose.model("Question"); // Assume Question model exists
// const Course = mongoose.model("Course"); // Assume Course model exists
// const Faculty = mongoose.model("Faculty"); // Assume Faculty model exists
// const SchoolYear = mongoose.model("SchoolYear"); // Assume SchoolYear model exists


const obj = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
    5: '5th Year'
}

// Create a new evaluation
exports.createEvaluation = async (req, res) => {
    let session = null;
    try {
        const {
            course_id,
            faculty_id,
            school_year,
            semester,
            groups_id,
            comments,
            isCompleted
        } = req.body;
        const student_id = req.query.id; // student_id
        const year_level = req.query.year_level; // e.g., "First Year", "Second Year"

        // Start a session and transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Create evaluation within the transaction
        const evaluation = new Evaluation({
            student_id,
            course_id,
            faculty_id,
            school_year,
            semester,
            groups_id,
            comments: comments || "",
            isCompleted: isCompleted || false
        });
        console.log("ito yun", evaluation)
        await evaluation.save({ session });

        // Update checklist with evaluation ID within the transaction
        const courseObjectId = new mongoose.Types.ObjectId(course_id);
        const updateResult = await Checklist.updateOne(
            {
                student_id: student_id,
                'years.year': obj[year_level],
            },
            {
                $set: {
                    [`years.$.semesters.${semester}.$[course].eval_id`]: evaluation._id
                }
            },
            {
                arrayFilters: [
                    { 'course.course_id': courseObjectId }
                ],
                session
            }
        );

        if (updateResult.matchedCount === 0) {
            throw new Error("Checklist not found for the specified student and year");
        }
        if (updateResult.modifiedCount === 0) {
            throw new Error("Failed to update checklist: course not found in the specified semester");
        }

        // Populate references for response
        const populatedEvaluation = await Evaluation.findById(evaluation._id)
            .session(session)
            .populate("course_id", "courseTitle courseCode")
            .populate("faculty_id", "name")
            .populate("school_year", "year")
            .populate("groups_id", "title");

        if (!populatedEvaluation.faculty_id) {
            throw new Error("Faculty data not found for the provided faculty_id");
        }

        // Commit the transaction
        await session.commitTransaction();

        res.status(201).json({
            message: "Evaluation created successfully",
            evaluation: populatedEvaluation
        });
    } catch (error) {
        // Abort the transaction on error
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }

        if (error.code === 11000) {
            return res.status(409).json({ error: "Evaluation already exists for this course, faculty, and semester" });
        }
        
        console.error("Error creating evaluation:", error);
        if (error.message.includes("Checklist not found")) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes("Failed to update checklist")) {
            return res.status(400).json({ error: error.message });
        }
        if (error.message.includes("Faculty data not found")) {
            return res.status(404).json({ error: error.message });
        }

        res.status(500).json({ error: "Server error while creating evaluation" });
    } finally {
        // End the session
        if (session) {
            session.endSession();
        }
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

