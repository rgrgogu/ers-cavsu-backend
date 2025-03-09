const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.post('/', RequireAuth, courseController.createCourse);
router.put('/:code/archive', RequireAuth, courseController.archiveCourse);
router.put('/:code', RequireAuth, courseController.editCourse);
router.get('/:code', RequireAuth, courseController.getCourse);
router.get('/', RequireAuth, courseController.getAllCourses);

module.exports = router;