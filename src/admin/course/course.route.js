const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

router.get('/', RequireAuth, courseController.getAllCourses);  
router.post('/', RequireAuth, courseController.createCourse);     
router.post('/mass', RequireAuth, courseController.createCoursesMass);  
router.put('/archive', RequireAuth, courseController.archiveCourse); 
router.put('/:id', RequireAuth, courseController.updateCourse);       

module.exports = router;