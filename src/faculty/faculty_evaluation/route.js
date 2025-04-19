const express = require('express');
const router = express.Router();

const FacultyEvaluationController = require('./controller');

// Assuming you have authentication middleware
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get("/", RequireAuth, FacultyEvaluationController.getEvaluationsByStudent);

module.exports = router;