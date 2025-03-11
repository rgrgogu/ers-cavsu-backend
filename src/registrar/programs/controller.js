const Program = require('./model');

const programController = {
    // Create a new program
    createProgram: async (req, res) => {
        try {
            const { name, code } = req.body;
            const createdBy = req.user._id; // Assuming user is authenticated

            const newProgram = new Program({ name, code, createdBy });
            const savedProgram = await newProgram.save();

            res.status(201).json(savedProgram);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Read all active programs
    getAllPrograms: async (req, res) => {
        try {
            const programs = await Program.find({ isArchived: false })
                .populate('createdBy', 'name');
            res.json(programs);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Read single program
    getProgram: async (req, res) => {
        try {
            const program = await Program.findById(req.params.id)
                .populate('createdBy', 'name');
            if (!program || program.isArchived) {
                return res.status(404).json({ message: 'Program not found' });
            }
            res.json(program);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update program
    updateProgram: async (req, res) => {
        try {
            const { name, code } = req.body;
            const program = await Program.findById(req.params.id);

            if (!program || program.isArchived) {
                return res.status(404).json({ message: 'Program not found' });
            }

            program.name = name || program.name;
            program.code = code || program.code;

            const updatedProgram = await program.save();
            res.json(updatedProgram);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Archive program (instead of delete)
    archiveProgram: async (req, res) => {
        try {
            const program = await Program.findById(req.params.id);

            if (!program || program.isArchived) {
                return res.status(404).json({ message: 'Program not found' });
            }

            program.isArchived = true;
            const archivedProgram = await program.save();
            res.json({ message: 'Program archived successfully', program: archivedProgram });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Get archived programs
    getArchivedPrograms: async (req, res) => {
        try {
            const programs = await Program.find({ isArchived: true })
                .populate('createdBy', 'username');
            res.json(programs);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = programController;