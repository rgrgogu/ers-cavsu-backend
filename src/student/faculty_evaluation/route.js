const express = require('express');
const router = express.Router();

const FacultyEvaluationController = require('./controller');

// Assuming you have authentication middleware
const RequireAuth = require("../../../global/middleware/RequireAuth");


// Create a new evaluation
router.post("/", RequireAuth, FacultyEvaluationController.createEvaluation);
router.get("/", RequireAuth, FacultyEvaluationController.getEvaluationsByStudent);

module.exports = router;