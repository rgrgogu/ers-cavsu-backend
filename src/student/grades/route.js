const express = require('express');
const router = express.Router();

const RequireAuth = require("../../../global/middleware/RequireAuth");
const GradeController = require('./controller');

// Create a new evaluation
router.get("/", RequireAuth, GradeController.GetStudentGrade);
// router.post("/", RequireAuth, GradeController.createEvaluation);

module.exports = router;