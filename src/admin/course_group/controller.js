const CourseGroup = require('./model'); // Assuming the schema file is in models folder

const CourseGroupController = {
    // Create a new course group
    createCourseGroup: async (req, res) => {
        try {
            const { groupName, description, program, updated_by } = req.body;

            const courseGroup = new CourseGroup({
                groupName,
                description,
                program: Array.isArray(program) ? program : [], // Use empty array if program is null or undefined
                updated_by,
                isArchived: false,
            });
            const savedGroup = await courseGroup.save();

            // Populate the programs field after saving
            const populatedGroup = await CourseGroup.findById(savedGroup._id).populate('program', 'name code'); // Assuming 'programs' is the field name in your schema

            res.status(201).json(populatedGroup);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Get all course groups
    getAllCourseGroups: async (req, res) => {
        try {
            const { archived } = req.query;

            const courseGroups = await CourseGroup.find({ isArchived: archived })
                .populate('updated_by', 'name') // Populate user info if needed
                .populate('program', 'name code');

            res.json(courseGroups);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Get single course group by ID
    getCourseGroup: async (req, res) => {
        try {
            const courseGroup = await CourseGroup.findById(req.params.id)
                .populate('updated_by', 'name');

            if (!courseGroup || courseGroup.isArchived) {
                return res.status(404).json({ message: 'Course group not found' });
            }
            res.json(courseGroup);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Update course group
    updateCourseGroup: async (req, res) => {
        try {
            const { groupName, description, program, updated_by } = req.body;

            const courseGroup = await CourseGroup.findByIdAndUpdate(
                req.params.id,
                { groupName, description, program, updated_by },
                { new: true, runValidators: true }
            ).populate('program', 'name code'); // Populate the program field

            if (!courseGroup || courseGroup.isArchived) {
                return res.status(404).json({ message: 'Course group not found' });
            }
            res.json(courseGroup);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    // Archive (soft delete) course group
    archiveCourseGroup: async (req, res) => {
        try {
            const { ids, archived, updated_by } = req.body

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
            const result = await CourseGroup.updateMany(
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

            // Get the updated documents (optional, if you need to return them)
            const updatedCourseGroups = await CourseGroup.find({ _id: { $in: ids } });

            res.json({
                message: `${result.modifiedCount} course group(s) archived successfully`,
                modifiedCount: result.modifiedCount,
                courseGroups: updatedCourseGroups
            });
        } catch (error) {
            res.status(400).json({
                message: 'Failed to archive course groups',
                error: error.message
            });
        }
    }
}

module.exports = CourseGroupController;


