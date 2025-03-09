const Survey = require('./survey.model'); // Assuming the model file is named surveyModel.js

// Create new survey feedback
const createSurvey = async (req, res) => {
    try {
        const data = req.body;

        await Survey.create(data);

        res.status(201).json({
            success: true,
            message: 'Survey feedback created successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating survey feedback',
            error: error.message
        });
    }
};

// Get all survey feedback
const getAllSurveys = async (req, res) => {
    try {
        const surveys = await Survey.find()
            .populate('user', 'name') // Populate user details, adjust fields as needed
            .sort({ createdAt: -1 }); // Sort by creation date descending

        res.status(200).json({
            success: true,
            message: 'Surveys retrieved successfully',
            count: surveys.length,
            data: surveys
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating survey feedback',
            error: error.message
        });
    }
};

module.exports = {
    createSurvey,
    getAllSurveys
};