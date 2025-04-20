const express = require("express");
const router = express.Router();
const StudentController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/get_new_firstyear", RequireAuth, StudentController.get_new_firstyear);
router.get("/get_all_students", RequireAuth, StudentController.get_all_students);
router.get("/get_enrollment_by_student_id", RequireAuth, StudentController.get_enrollment_by_student_id);
router.get("/get_checklist_by_student/:id", RequireAuth, StudentController.get_checklist_by_student);

module.exports = router;