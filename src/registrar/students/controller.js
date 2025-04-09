const Student = require("../../auth/login/model")

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
}

module.exports = StudentController;