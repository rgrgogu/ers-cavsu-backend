const express = require('express');
const router = express.Router();
const curriculumController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/get_courses', RequireAuth, curriculumController.getGroupsWithCourses); // Count by program

module.exports = router;