const express = require('express');
const router = express.Router();

const FacultyEvaluationController = require('./controller');

// Assuming you have authentication middleware
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.post('/', RequireAuth, FacultyEvaluationController.createFacultyEvaluation);
router.put('/edit_eval/:id', RequireAuth, FacultyEvaluationController.updateFacultyEvaluation);
router.get('/get_active', RequireAuth, FacultyEvaluationController.getFacultyEvaluations);
router.get('/get_all', RequireAuth, FacultyEvaluationController.getAllFacultyEvaluations);

module.exports = router;