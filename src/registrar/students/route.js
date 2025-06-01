const express = require("express");
const router = express.Router();
const StudentController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/get_new_firstyear", RequireAuth, StudentController.get_new_firstyear);
router.get("/get_old_students", RequireAuth, StudentController.get_old_students);
router.get("/get_all_students", RequireAuth, StudentController.get_all_students);
router.get("/get_checklist_by_student_sem/:id", RequireAuth, StudentController.get_checklist_by_student_sem);
router.get("/get_enrollment_by_student_id", RequireAuth, StudentController.get_enrollment_by_student_id);
router.get("/get_gradeslip_by_sem_yrlvl", RequireAuth, StudentController.get_gradeslip_by_sem_yrlvl)
router.get("/get_checklist_by_student/:id", RequireAuth, StudentController.get_checklist_by_student);
router.get("/get_gradeslips/:id", RequireAuth, StudentController.get_gradeslips);
router.get("/get_cors/:id", RequireAuth, StudentController.get_cors);

module.exports = router;