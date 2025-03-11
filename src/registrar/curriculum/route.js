const express = require('express');
const router = express.Router();
const curriculumController = require('./curriculumController');

// Assuming authentication middleware
const auth = require('../middleware/auth');

// Routes
router.post('/', auth, curriculumController.createCurriculum);                // Create
router.get('/program/:programId', curriculumController.getCurriculumByProgramClustered); // Get clustered
router.get('/count/:programId', curriculumController.getCurriculumCountByProgram); // Count by program

module.exports = router;