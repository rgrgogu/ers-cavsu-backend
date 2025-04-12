const express = require('express');
const router = express.Router();
const enrollmentController = require('./controller');

const RequireAuth = require("../../../global/middleware/RequireAuth");

// Routes
router.get('/', RequireAuth, enrollmentController.GetEnrollmentAll);
router.get('/:id', RequireAuth, enrollmentController.GetEnrollmentById);
router.post('/mass', RequireAuth, enrollmentController.MassCreateEnlistment);
router.put('/:id', RequireAuth, enrollmentController.EditEnrollment);

// router.get('/', RequireAuth, enrollmentController.getEnrollments);
// //router.get('/get_enrollments', RequireAuth, enrollmentController.getEnrollmentsByCriteria); // Custom route for filtered enrollments
// router.get('/get_new_enrollment_firstyear', RequireAuth, enrollmentController.get_new_enrollment_firstyear); // Custom route for filtered enrollments
// router.get('/:id', RequireAuth, enrollmentController.getEnrollment);
// router.post('/mass_enroll_firstyear', RequireAuth, enrollmentController.mass_enroll_firstyear);
// //router.put('/:id', RequireAuth, enrollmentController.updateEnrollment);
// //router.put('/add-subject/:id', RequireAuth, enrollmentController.addSubjectToChecklist); // Custom route for adding subjects
// //router.put('/update-subject-status/:id', RequireAuth, enrollmentController.updateSubjectStatus); // Custom route for updating status


module.exports = router;