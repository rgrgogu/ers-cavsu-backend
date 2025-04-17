const express = require('express');
const router = express.Router();
const EnrollmentController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', EnrollmentController.GetEnrollmentByStudentId);



module.exports = router;