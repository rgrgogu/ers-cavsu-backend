// routes/schoolYearRoutes.js
const express = require('express');
const router = express.Router();
const schoolYearsController = require('./controller');
const RequireAuth = require("../../../global/middleware/RequireAuth");

router.post('/', RequireAuth, schoolYearsController.createSchoolYear);          // Create a new school year
router.get('/', RequireAuth, schoolYearsController.getAllSchoolYears);          // Get all school years
router.get('/:id', RequireAuth, schoolYearsController.getSchoolYearById);       // Get a specific school year
router.put('/archive_many', RequireAuth, schoolYearsController.archiveManySchoolYears); // Archive multiple school years
router.put('/:id', RequireAuth, schoolYearsController.updateSchoolYear) // Update school year

module.exports = router;