const express = require('express');
const router = express.Router();
const courseController = require('./course.controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// CRUA Routes
router.post('/', RequireAuth, courseController.createCourse);          // Create
router.get('/', RequireAuth, courseController.getAllCourses);               // Read all active
router.get('/archived', RequireAuth, courseController.getArchivedCourses);  // Read all archived
router.get('/:id', RequireAuth, courseController.getCourse);               // Read single
router.put('/:id', RequireAuth, courseController.updateCourse);       // Update
router.delete('/:id', RequireAuth, courseController.archiveCourse);   // Archive

module.exports = router;