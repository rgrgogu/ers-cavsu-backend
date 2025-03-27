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
            const { ids, archived, updated_by } = req.body;

            // Validate input
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({ message: 'Please provide an array of course group IDs' });
            }
            if (typeof archived !== 'boolean') {
                return res.status(400).json({ message: 'Archived status must be a boolean' });
            }
            if (!updated_by) {
                return res.status(400).json({ message: 'Updated_by field is required' });
            }

            // Update multiple course groups
            const result = await Program.updateMany(
                { _id: { $in: ids } },
                {
                    $set: {
                        isArchived: archived,
                        updated_by: updated_by,
                    }
                },
                { new: true }
            );

            // Check if any documents were modified
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'No course groups found with provided IDs' });
            }

            res.json({
                message: `${result.modifiedCount} course group(s) archived successfully`,
                modifiedCount: result.modifiedCount,
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
};

module.exports = programController;