const Program = require('./model');

const programController = {
    // Create a new program
    createProgram: async (req, res) => {
        try {
            const data = req.body;

            const newProgram = new Program({ ...data });
            const savedProgram = await newProgram.save();

            res.status(201).json(savedProgram);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Read all active programs
    getAllPrograms: async (req, res) => {
        try {
            const { archived } = req.query
            const programs = await Program.find({ isArchived: archived || false })
                .populate('updated_by', 'name');

            res.status(200).json(programs);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update program
    updateProgram: async (req, res) => {
        try {
            const { name, code, applicant_types, updated_by } = req.body;
            const program = await Program.findById(req.params.id);

            if (!program || program.isArchived) {
                return res.status(404).json({ message: 'Program not found' });
            }

            program.name = name || program.name;
            program.code = code || program.code;
            program.applicant_types = applicant_types || program.applicant_types
            program.updated_by = updated_by || program.updated_by

            const updatedProgram = await program.save();
            res.status(200).json(updatedProgram);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Archive program (instead of delete)
    archiveProgram: async (req, res) => {
        try {
            const { archived, updated_by } = req.body;

            const program = await Program.findById(req.params.id);

            program.isArchived = archived;
            program.updated_by = updated_by;

            const archivedProgram = await program.save();
            res.status(200).json({ message: 'Program archived successfully', program: archivedProgram });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
};

module.exports = programController;