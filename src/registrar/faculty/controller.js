const Faculty = require("../../auth/login/model")

const FacultyController = {
    // List all Faculty users
    GetAllFaculty: async (req, res) => {
        try {
            const faculty = await Faculty.find({ isArchived: false, role: "faculty" })
                .select("name")
                .sort({ "name.lastname": 1 });

            res.json(faculty);
        } catch (error) {
            res.status(400).json({ message: "Error fetching faculty", error: error.message });
        }
    },
}

module.exports = FacultyController