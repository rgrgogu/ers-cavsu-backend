const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// CRUA Routes
router.get('/', RequireAuth, courseController.getAllCourses);  
router.post('/', RequireAuth, courseController.createCourse);     
router.put('/:id', RequireAuth, courseController.updateCourse);       
router.put('/archive/:id', RequireAuth, courseController.archiveCourse);   

module.exports = router;