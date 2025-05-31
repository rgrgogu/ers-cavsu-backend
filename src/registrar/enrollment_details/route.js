const express = require('express');
const router = express.Router();
const EnrollmentDetailsController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, EnrollmentDetailsController.GetCoursesBySection)
router.get('/get_available', RequireAuth, EnrollmentDetailsController.GetAvailableCoursesForIrreg)
router.put('/', RequireAuth, EnrollmentDetailsController.MassUpdateSchedules)

module.exports = router;