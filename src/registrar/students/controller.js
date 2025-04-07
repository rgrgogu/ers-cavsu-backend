const Student = require("../../auth/login/model")

const StudentController = {
    // List all Students
    get_new_firstyear: async (req, res) => {
        try {
            const students = await Student.find({ isArchived: false, year_level: 1, student_type: 'New', enrollment_id: null })
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