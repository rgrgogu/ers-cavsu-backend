const Student = require("../../student/login/model")

const StudentController = {
    // List all Students
    listStudents: async (req, res) => {
        try {
            const students = await Student.find({ isArchived: false })
                .select("-password")
                .sort({ student_id: 1 })
                .populate('program')
                .populate('updated_by');

            res.json(students);
        } catch (error) {
            res.status(400).json({ message: "Error fetching students", error: error.message });
        }
    },
}

module.exports = StudentController;