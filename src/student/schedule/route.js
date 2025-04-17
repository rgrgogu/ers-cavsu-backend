const express = require('express');
const router = express.Router();
const EnrollmentDetailsController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, EnrollmentDetailsController.GetCoursesByStudent);

module.exports = router;