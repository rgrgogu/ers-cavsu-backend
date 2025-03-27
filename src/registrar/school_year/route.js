// routes/schoolYearRoutes.js
const express = require('express');
const router = express.Router();
const schoolYearsController = require('./controller');

router.post('/', schoolYearsController.createSchoolYear);          // Create a new school year
router.get('/', schoolYearsController.getAllSchoolYears);          // Get all school years
router.get('/:id', schoolYearsController.getSchoolYearById);       // Get a specific school year
router.put('/:id', schoolYearsController.updateSchoolYear);        // Update a school year
router.patch('/:id/enrollment', schoolYearsController.setEnrollmentSemester); // Set enrollment semester
router.patch('/:id/archive', schoolYearsController.archiveSchoolYear); // Archive a school year
router.patch('/archive-many', schoolYearsController.archiveManySchoolYears); // Archive multiple school years

module.exports = router;