const express = require('express');
const router = express.Router();
const curriculumController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, curriculumController.getCurricula);
router.get('/get_courses', RequireAuth, curriculumController.getGroupsWithCourses); // Count by program
router.get('/:id', curriculumController.getCurriculum);
router.post('/', RequireAuth, curriculumController.createCurriculum);
router.put('/:id', RequireAuth, curriculumController.updateCurriculum);
router.patch('/:id/archive', RequireAuth, curriculumController.archiveCurriculum);

module.exports = router;