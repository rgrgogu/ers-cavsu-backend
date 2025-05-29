const express = require('express');
const router = express.Router();
const ChecklistController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/:id', RequireAuth, ChecklistController.GetChecklistForEnrollee);
router.get('/student/:id', RequireAuth, ChecklistController.GetChecklistForStudent);
router.get('/check_student_course/:student_id/:course_id', RequireAuth, ChecklistController.CheckIfCourseIsPassed);

module.exports = router;