// routes/courseGroup.js
const express = require('express');
const router = express.Router();
const courseGroupController = require('./controller');
const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, courseGroupController.getAllCourseGroups);
router.get('/:id', RequireAuth, courseGroupController.getCourseGroup);
router.post('/', RequireAuth, courseGroupController.createCourseGroup);
router.put('/archive', RequireAuth, courseGroupController.archiveCourseGroup);
router.put('/:id', RequireAuth, courseGroupController.updateCourseGroup);
// router.post('/:id/add-course', RequireAuth, courseGroupController.addCourseToGroup);

module.exports = router;