const FacultyEvaluation = require('./model'); // Adjust path as needed
const mongoose = require('mongoose');

// Create a new faculty evaluation
const createFacultyEvaluation = async (req, res) => {
    try {
        const { id } = req.query;
        const { title, groups_id, isActive } = req.body;

        // Create new evaluation
        const facultyEvaluation = new FacultyEvaluation({
            title,
            groups_id,
            isActive: isActive !== undefined ? isActive : true,
            created_by: id,
            updated_by: id,
        });

        const savedEvaluation = await facultyEvaluation.save();
        return res.status(201).json(savedEvaluation);
    } catch (error) {
        return res.status(500).json({ error: 'Server error while creating evaluation', details: error.message });
    }
};

// Update an existing faculty evaluation
const updateFacultyEvaluation = async (req, res) => {
    try {
        const doc_id = req.params.id; // Category group ID from params
        const id = req.query.id;     // Admin ID from query
        const { title, groups_id, isActive } = req.body;
        console.log(req.body)
        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid evaluation ID' });
        }

        // Validate group IDs if provided
        if (groups_id) {
            if (!Array.isArray(groups_id) || groups_id.length === 0) {
                return res.status(400).json({ error: 'Group IDs must be a non-empty list' });
            }
            const invalidGroups = groups_id.filter(groupId => !mongoose.Types.ObjectId.isValid(groupId));
            if (invalidGroups.length > 0) {
                return res.status(400).json({ error: 'Invalid group IDs provided' });
            }
        }

        // Find and update evaluation
        const updateData = {
            ...(title && { title }),
            ...(groups_id && { groups_id }),
            ...(isActive !== undefined && { isActive }),
            updated_by: id, // Assumes user ID from auth middleware
        };

        const updatedEvaluation = await FacultyEvaluation.findByIdAndUpdate(
            { _id: doc_id },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedEvaluation) {
            return res.status(404).json({ error: 'Faculty evaluation not found' });
        }

        return res.status(200).json(updatedEvaluation);
    } catch (error) {
        return res.status(500).json({ error: 'Server error while updating evaluation', details: error.message });
    }
};

// Get faculty evaluations with optional filtering
const getFacultyEvaluations = async (req, res) => {
    try {
        const { isActive } = req.query;

        // Build query
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Fetch evaluations with populated groups_id
        const evaluations = await FacultyEvaluation.find(query)
            .populate('groups_id', 'title') // Populate group details
            .populate({
                path: 'created_by',
                select: 'name',
            })
            .populate({
                path: 'updated_by',
                select: 'name',
            })
            .sort({ updatedAt: -1 })

        return res.status(200).json(evaluations);
    } catch (error) {
        return res.status(500).json({ error: 'Server error while fetching evaluations', details: error.message });
    }
};

// Get all faculty evaluations
const getAllFacultyEvaluations = async (req, res) => {
    try {
        // Fetch all evaluations with populated groups_id
        const evaluations = await FacultyEvaluation.find({})
            .populate('groups_id', 'title') // Populate group details
            .populate({
                path: 'created_by',
                select: 'name',
            })
            .populate({
                path: 'updated_by',
                select: 'name',
            })
            .sort({ updatedAt: -1 })

        return res.status(200).json(evaluations);
    } catch (error) {
        return res.status(500).json({ error: 'Server error while fetching all evaluations', details: error.message });
    }
};

module.exports = {
    createFacultyEvaluation,
    updateFacultyEvaluation,
    getFacultyEvaluations,
    getAllFacultyEvaluations,
};