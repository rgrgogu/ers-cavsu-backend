const express = require('express');
const router = express.Router();
const {
    createSurvey,
    findSurvey,
    getAllSurveys
} = require('./survey.controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get("/:id", RequireAuth, findSurvey)
router.post("/", RequireAuth, createSurvey)

module.exports = router;