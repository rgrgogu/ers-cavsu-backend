const express = require('express');
const router = express.Router();

const RequireAuth = require("../../../global/middleware/RequireAuth");
const GradeController = require('./controller');

// Create a new evaluation
router.get("/", RequireAuth, GradeController.GetStudentGrade);
router.get("/get_gradeslip_by_sem_yrlvl", RequireAuth, GradeController.get_gradeslip_by_sem_yrlvl);
// router.post("/", RequireAuth, GradeController.createEvaluation);

module.exports = router;