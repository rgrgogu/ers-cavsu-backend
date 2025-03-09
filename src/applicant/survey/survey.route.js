const express = require('express');
const router = express.Router();
const {
    createSurvey,
    getAllSurveys
} = require('./survey.controller');

// Routes
router.route('/')
    .post(createSurvey)    // Create new survey feedback
    .get(getAllSurveys);   // Get all survey feedback

module.exports = router;