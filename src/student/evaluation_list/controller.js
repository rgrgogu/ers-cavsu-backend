const FacultyEvaluation = require('../../registrar/evaluation_list/model'); // Adjust path as needed
const mongoose = require('mongoose');


// Get faculty evaluations with optional filtering
const getFacultyEvaluations = async (req, res) => {
    try {
        const isActive = req.query.active;
        console.log("isActive", isActive);

        // Fetch evaluations with populated groups_id
        const evaluations = await FacultyEvaluation.find({isActive: isActive })
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


module.exports = {
    getFacultyEvaluations,
};