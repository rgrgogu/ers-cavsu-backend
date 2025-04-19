const express = require('express');
const router = express.Router();
const GradeController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get("/", RequireAuth, GradeController.GetStudentGrades)
router.put('/', RequireAuth, GradeController.MassUploadGrades);

module.exports = router;