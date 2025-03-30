const express = require("express");
const router = express.Router();
const UserController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/admins", RequireAuth, UserController.listAdmins);
router.post("/admins", RequireAuth, UserController.createAdmin);

router.get("/admissions", RequireAuth, UserController.listAdmissions);
router.post("/admissions", RequireAuth, UserController.createAdmission);

router.get("/applicants", RequireAuth, UserController.listApplicants);
router.post("/applicants", RequireAuth, UserController.massCreateStudents);

router.get("/faculty", RequireAuth, UserController.listFaculty);
router.post("/faculty", RequireAuth, UserController.createFaculty);

router.get("/registrars", RequireAuth, UserController.listRegistrars);
router.post("/registrars", RequireAuth, UserController.createRegistrar);

router.get("/students", RequireAuth, UserController.listStudents);
router.post("/students", RequireAuth, UserController.createStudent);

module.exports = router;